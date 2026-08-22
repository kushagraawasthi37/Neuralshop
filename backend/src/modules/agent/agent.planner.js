import { callGroq } from "../../utils/groq.js";
import { plannerSystemPrompt } from "./agent.prompts.js";
import { normalizeToolCall } from "./agent.validator.js";

export const fallbackPlan = (text) => {
  const value = text.toLowerCase();
  const price = value.match(/(?:under|below|less than)\s*[₹rs.]*\s*([\d,]+)/i)?.[1];
  const maxPrice = price ? Number(price.replaceAll(",", "")) : undefined;
  const size = value.match(/\b(xs|s|m|l|xl|xxl)\b/i)?.[1]?.toUpperCase();
  if (/\b(pay|payment|purchase|charge)\b/i.test(value)) return { intent: "checkout", tool: null, response: "Payment requires your explicit approval in the checkout flow." };
  if (value.includes("compare")) return { intent: "comparison", tool: null, response: "Share two to five products and I will compare them." };
  if (value.includes("wishlist") || value.includes("save")) return { intent: "wishlist", tool: null, response: "Tell me which product you want to save." };
  if (value.includes("checkout") || value.includes("prepare order")) return { intent: "checkout", tool: { name: "prepare_order", arguments: {} }, response: "I will validate your cart and prepare checkout." };
  if (value.includes("inventory") || value.includes("available") || value.includes("stock")) return { intent: "inventory", tool: null, response: "Tell me the product and size to check." };
  if (value.includes("my size") || value.includes("usual size")) return { intent: "inventory", tool: null, response: "Tell me which product to check, and I will verify your size against live inventory." };
  if (/\b(add|remove|buy|get)\b/.test(value) && !/\b(outfit|dress|shoe|jacket|product|item)\b/.test(value)) return { intent: "cart", tool: null, response: "Tell me which product you want me to use." };
  return {
    intent: "product_discovery",
    tool: { name: "search_products", arguments: { query: text.trim(), ...(maxPrice ? { maxPrice } : {}), ...(size ? { size } : {}) } },
    response: "I am searching the catalog and checking what fits your request.",
  };
};

export const planAgentRequest = async (text, context) => {
  return planNextAction(text, context, []);
};

export const planNextAction = async (text, context, observations = []) => {
  const memory = context.memory || {};
  const candidates = memory.candidateProducts || [];
  if (memory.selectedProductId && /\b(add|cart)\b/i.test(text) && /\b(xs|s|m|l|xl|xxl)\b/i.test(text)) {
    return { intent: "cart", tool: { name: "add_to_cart", arguments: { productId: memory.selectedProductId, size: text.match(/\b(xs|s|m|l|xl|xxl)\b/i)[1].toUpperCase(), quantity: 1 } }, provider: "memory" };
  }
  const ordinal = text.match(/\b(first|second|third|fourth|fifth)\b/i)?.[1]?.toLowerCase();
  const ordinalIndex = { first: 0, second: 1, third: 2, fourth: 3, fifth: 4 };
  if (ordinal && candidates[ordinalIndex[ordinal]]) {
    const productId = candidates[ordinalIndex[ordinal]];
    if (/\b(save|wishlist)\b/i.test(text)) return { intent: "wishlist", tool: { name: "wishlist_product", arguments: { productId } }, provider: "memory" };
    if (/\b(add|cart|select|choose|show|view|option|one)\b/i.test(text)) {
      if (/\b(add|cart)\b/i.test(text) && /\b(xs|s|m|l|xl|xxl)\b/i.test(text)) return { intent: "cart", tool: { name: "add_to_cart", arguments: { productId, size: text.match(/\b(xs|s|m|l|xl|xxl)\b/i)[1].toUpperCase(), quantity: 1 } }, provider: "memory" };
      return { intent: "product_selection", tool: { name: "get_product_details", arguments: { productId } }, provider: "memory" };
    }
  }
  try {
    const raw = await callGroq([
      { role: "system", content: plannerSystemPrompt },
      { role: "user", content: JSON.stringify({ request: text, context, observations: observations.slice(-6) }) },
    ], { temperature: 0, maxTokens: 500 });
    const parsed = JSON.parse(raw);
    return {
      intent: parsed.intent || "unknown",
      tool: normalizeToolCall(parsed.next || parsed.tool),
      done: parsed.done === true,
      response: String(parsed.response || "I will look into that.").slice(0, 180),
      provider: "groq",
    };
  } catch {
    const previous = observations.at(-1);
    if (previous?.tool === "search_products" && previous.success && previous.data?.products?.length) {
      const first = previous.data.products[0];
      return { intent: "recommendation", tool: { name: "get_product_details", arguments: { productId: first.id } }, response: "I am checking the strongest match before recommending it.", provider: "deterministic" };
    }
    if (previous?.tool === "get_product_details" || previous?.tool === "check_inventory") {
      return { intent: "recommendation", tool: null, done: true, response: "I found a verified match from the catalog.", provider: "deterministic" };
    }
    return { ...fallbackPlan(text), provider: "deterministic" };
  }
};
