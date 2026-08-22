import crypto from "crypto";
import { callGroq } from "../../utils/groq.js";
import { logger } from "../../utils/logger.js";
import { planAgentRequest, planNextAction } from "./agent.planner.js";
import { executeAgentTool } from "./agent.tools.js";
import { readAgentMemory, writeAgentMemory } from "./agent.memory.service.js";
import { buildAgentContext } from "./agent.context.service.js";
import { synthesisSystemPrompt } from "./agent.prompts.js";
import { normalizeToolCall, transitionState } from "./agent.validator.js";
import { recordAgentEvent } from "./agent-event.service.js";

export const MAX_AGENT_STEPS = 6;
export const MAX_LLM_CALLS = 4;
const MAX_SAME_TOOL_CALLS = 2;
const AGENT_TIMEOUT_MS = 9000;
const TOTAL_AGENT_TIMEOUT_MS = 20000;

const activityFor = (tool) => ({
  search_products: "Searching the catalog",
  get_user_context: "Using your shopping preferences",
  get_recommendations: "Personalizing recommendations",
  compare_products: "Comparing selected products",
  check_inventory: "Checking real-time availability",
  add_to_cart: "Validating and updating your cart",
  remove_from_cart: "Updating your cart",
  wishlist_product: "Saving this product to your wishlist",
  prepare_order: "Preparing your order for checkout",
}[tool] || "Understanding your request");

const navigationResponse = (text, sessionId) => {
  const value = text.toLowerCase();
  const routes = [
    ["cart", "/cart", "Opening your cart."],
    ["orders", "/account/orders", "Opening your orders."],
    ["wishlist", "/account/wishlist", "Opening your wishlist."],
    ["profile", "/account/profile", "Opening your profile."],
    ["collection", "/collections", "Opening the collection."],
    ["home", "/", "Taking you home."],
  ];
  const match = routes.find(([keyword]) => value.includes(keyword));
  return match ? { sessionId, action: "navigate", params: { route: match[1] }, speak: match[2], message: match[2], activities: [{ label: "Understanding your request", status: "complete" }] } : null;
};

const synthesize = async (request, result, plan) => {
  if (plan.tool?.name === "prepare_order") return result.orderReady ? `Your order is ready for ₹${result.amount}. Continue to checkout when you are ready; payment still requires your explicit approval.` : result.message;
  if (result.product) return `I verified ${result.product.name} at ₹${result.product.price}. It is a strong match for your request.`;
  if (!result.products?.length) return "I could not find a suitable match yet. Try a broader style, category, or budget.";
  const fallback = result.products.slice(0, 3).map((p) => `${p.name} at ₹${p.price}`).join(", ");
  try {
    const raw = await callGroq([
      { role: "system", content: synthesisSystemPrompt },
      { role: "user", content: JSON.stringify({ request, products: result.products.slice(0, 6), reason: result.reason }) },
    ], { temperature: 0.2, maxTokens: 250, jsonMode: false });
    return raw.trim();
  } catch { return `I found ${fallback}. ${result.reason || "These are the strongest matches available now."}`; }
};

const compactObservation = (observation) => ({
  step: observation.step,
  tool: observation.tool,
  success: observation.success,
  error: observation.error,
  metadata: observation.metadata,
  data: observation.success ? {
    count: observation.data?.products?.length,
    products: observation.data?.products?.slice(0, 6).map(({ id, name, price, category, rating, sizes }) => ({ id, name, price, category, rating, sizes })),
    product: observation.data?.product ? { id: observation.data.product.id, name: observation.data.product.name, price: observation.data.product.price, sizes: observation.data.product.sizes } : undefined,
    availableStock: observation.data?.availableStock,
    orderReady: observation.data?.orderReady,
    orderId: observation.data?.orderId,
    amount: observation.data?.amount,
  } : undefined,
});

const withTimeout = (promise, label, timeout = AGENT_TIMEOUT_MS) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), timeout)),
]);

export const runAgent = async ({ text, userId = null, sessionId, addressId = null }) => {
  if (!text?.trim()) throw new Error("message is required");
  const started = Date.now();
  const navigation = navigationResponse(text, sessionId);
  if (navigation) return navigation;
  recordAgentEvent({ event: "agent_session_started", sessionId, userId });
  const deadline = started + TOTAL_AGENT_TIMEOUT_MS;
  const ownerId = userId || "guest";
  const context = await withTimeout(buildAgentContext({ userId, sessionId }), "context", Math.max(1, deadline - Date.now())).catch(() => ({
    constraints: {},
    historicalPreferences: {},
    currentCart: [],
    recentSearches: [],
    recentlyViewed: [],
    wishlistProductIds: [],
  }));
  const memory = await withTimeout(readAgentMemory(sessionId, ownerId), "memory", Math.max(1, deadline - Date.now())).catch(() => ({}));
  let llmCalls = 0;
  let plan = await withTimeout(planAgentRequest(text, { ...context, memory }), "planner").catch(() => ({ intent: "unknown", tool: null, response: "I could not complete the request in time. No payment was made.", provider: "fallback" }));
  llmCalls += plan.provider === "groq" ? 1 : 0;

  if (!plan.tool) {
    const wantsPayment = /\b(pay|payment|purchase|charge)\b/i.test(text);
    recordAgentEvent({ event: wantsPayment ? "agent_confirmation_requested" : "agent_intent_detected", sessionId, userId, intent: plan.intent });
    return { sessionId, intent: plan.intent, message: wantsPayment ? "I can prepare checkout, but payment requires your explicit approval in Razorpay." : plan.response, activities: [{ label: "Understanding your request", status: "complete" }], requiresConfirmation: wantsPayment, pendingAction: wantsPayment ? "payment_confirmation" : null, memory };
  }

  const toolContext = { userId, sessionId, addressId, idempotencyKey: `agent-${sessionId}-${crypto.createHash("sha1").update(`${text}:${JSON.stringify(plan.tool)}`).digest("hex").slice(0, 16)}` };
  const activities = [{ label: "Understanding your request", status: "complete" }];
  let result = null;
  let steps = 0;
  let lastTool = null;
  let lastArguments = {};
  let state = memory.state || "DISCOVERY";
  const observations = [];
  const fingerprints = new Set();
  const sameToolCalls = new Map();
  try {
    while (plan.tool && steps < MAX_AGENT_STEPS && Date.now() < deadline) {
      const call = normalizeToolCall(plan.tool);
      if (!call) throw new Error("Invalid tool proposal");
      const fingerprint = `${call.name}:${JSON.stringify(call.arguments)}`;
      if (fingerprints.has(fingerprint)) throw new Error("repeated tool call detected");
      fingerprints.add(fingerprint);
      const toolCount = (sameToolCalls.get(call.name) || 0) + 1;
      sameToolCalls.set(call.name, toolCount);
      if (toolCount > MAX_SAME_TOOL_CALLS) throw new Error("same tool call limit reached");
      steps += 1;
      lastTool = call.name;
      lastArguments = call.arguments;
      activities.push({ label: activityFor(call.name), status: "running" });
      recordAgentEvent({ event: "agent_tool_called", sessionId, userId, intent: plan.intent, tool: call.name });
      const observation = await withTimeout(executeAgentTool(call, toolContext), call.name, Math.max(1, deadline - Date.now()));
      observations.push(compactObservation({ step: steps, ...observation }));
      if (!observation.success) throw Object.assign(new Error(observation.error.message), { code: observation.error.code });
      result = observation.data;
      activities.at(-1).status = "complete";
      if (call.name === "add_to_cart" || call.name === "remove_from_cart") {
        recordAgentEvent({
          event: "agent_cart_action",
          sessionId,
          userId,
          intent: plan.intent,
          tool: call.name,
          productIds: call.arguments.productId ? [call.arguments.productId] : [],
          success: true,
        });
      }

      if (call.name === "search_products" && result.products?.length) {
        recordAgentEvent({ event: "agent_recommendation_generated", sessionId, userId, intent: plan.intent, tool: call.name, productIds: result.products.map((product) => product.id) });
      }
      if (call.name === "prepare_order" && result.orderReady) state = transitionState(state, "CHECKOUT_PREPARED");
      else if (["add_to_cart", "remove_from_cart", "wishlist_product"].includes(call.name)) state = transitionState(state, "CART_ACTION");
      else if (["search_products", "get_recommendations", "compare_products"].includes(call.name)) state = transitionState(state, "RECOMMENDATION");
      else if (["get_product_details", "check_inventory"].includes(call.name)) state = transitionState(state, "PRODUCT_SELECTED");
      if (Date.now() >= deadline || steps >= MAX_AGENT_STEPS) break;
      if (llmCalls >= MAX_LLM_CALLS) break;
      plan = await withTimeout(planNextAction(text, { ...context, memory, state }, observations), "replanner", Math.max(1, deadline - Date.now())).catch(() => ({ tool: null, done: true, response: "I found the strongest verified result." }));
      llmCalls += plan.provider === "groq" ? 1 : 0;
      if (plan.done) break;
    }
    if ((steps >= MAX_AGENT_STEPS || Date.now() >= deadline) && plan.tool) throw new Error("agent step limit reached");
  } catch (error) {
    logger.warn("Agent tool failed", { tool: lastTool, message: error.message, userId, sessionId });
    recordAgentEvent({ event: "agent_tool_failed", sessionId, userId, intent: plan.intent, tool: lastTool, success: false, latencyMs: Date.now() - started });
    activities.at(-1).status = "failed";
    return { sessionId, intent: plan.intent, message: error.message.includes("timeout") || error.message.includes("limit") ? "I could not complete the request in time. No payment was made." : "I could not complete that commerce action. Nothing was charged.", activities, error: "tool_failed", tool: lastTool, steps, llmCalls, observations };
  }

  const nextMemory = await writeAgentMemory(sessionId, { intent: plan.intent, filters: lastArguments, candidateProducts: result?.products?.slice(0, 6).map((p) => p.id), selectedProductId: lastArguments.productId || memory.selectedProductId, preparedOrderId: result?.orderId || memory.preparedOrderId, state, pendingAction: lastTool === "prepare_order" && result?.orderReady ? "payment_confirmation" : null }, ownerId);
  const orderReady = lastTool === "prepare_order" && result?.orderReady;
  if (orderReady) recordAgentEvent({ event: "agent_checkout_prepared", sessionId, userId, intent: plan.intent, tool: lastTool, orderId: result.orderId, amount: result.amount });
  recordAgentEvent({ event: "agent_completed", sessionId, userId, intent: plan.intent, tool: lastTool, success: true, latencyMs: Date.now() - started, productIds: result?.products?.map((product) => product.id) || [], orderId: result?.orderId, amount: result?.amount });
  const finalPlan = { ...plan, tool: { name: lastTool } };
  const message = llmCalls < MAX_LLM_CALLS && Date.now() < deadline ? await withTimeout(synthesize(text, result, finalPlan), "synthesis", Math.max(1, deadline - Date.now())).catch(() => plan.response || "I found a verified result from the catalog.") : (plan.response || "I found a verified result from the catalog.");
  if (llmCalls < MAX_LLM_CALLS && plan.provider === "groq") llmCalls += 1;
  return { sessionId, intent: plan.intent, message, activities, tool: lastTool, toolArguments: lastArguments, data: result, memory: nextMemory, requiresConfirmation: orderReady, pendingAction: orderReady ? "payment_confirmation" : null, steps, llmCalls, observations, latencyMs: Date.now() - started };
};
