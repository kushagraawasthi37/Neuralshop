import mongoose from "mongoose";

const TOOL_NAMES = new Set([
  "search_products",
  "get_product_details",
  "get_user_context",
  "get_recommendations",
  "compare_products",
  "check_inventory",
  "add_to_cart",
  "remove_from_cart",
  "wishlist_product",
  "prepare_order",
]);

const SIZES = new Set(["XS", "S", "M", "L", "XL", "XXL"]);
export const AGENT_STATES = new Set([
  "DISCOVERY",
  "RECOMMENDATION",
  "PRODUCT_SELECTED",
  "CART_ACTION",
  "CHECKOUT_PREPARED",
  "PAYMENT_CONFIRMATION_REQUIRED",
  "PAYMENT_STARTED",
  "PAYMENT_CONFIRMED",
]);

const allowedTransitions = {
  DISCOVERY: new Set(["DISCOVERY", "RECOMMENDATION", "PRODUCT_SELECTED", "CHECKOUT_PREPARED"]),
  RECOMMENDATION: new Set(["RECOMMENDATION", "PRODUCT_SELECTED", "CART_ACTION", "CHECKOUT_PREPARED"]),
  PRODUCT_SELECTED: new Set(["PRODUCT_SELECTED", "CART_ACTION", "CHECKOUT_PREPARED"]),
  CART_ACTION: new Set(["CART_ACTION", "RECOMMENDATION", "CHECKOUT_PREPARED"]),
  CHECKOUT_PREPARED: new Set(["CHECKOUT_PREPARED", "PAYMENT_CONFIRMATION_REQUIRED", "PAYMENT_STARTED"]),
  PAYMENT_CONFIRMATION_REQUIRED: new Set(["PAYMENT_CONFIRMATION_REQUIRED", "PAYMENT_STARTED"]),
  PAYMENT_STARTED: new Set(["PAYMENT_STARTED", "PAYMENT_CONFIRMED"]),
  PAYMENT_CONFIRMED: new Set(["PAYMENT_CONFIRMED"]),
};

export const normalizeToolCall = (candidate = {}) => {
  if (!candidate || typeof candidate !== "object") return null;
  const name = String(candidate.name || "").trim();
  if (!TOOL_NAMES.has(name)) return null;
  const args = candidate.arguments && typeof candidate.arguments === "object"
    ? candidate.arguments
    : {};
  return { name, arguments: args };
};

export const validateToolArguments = (name, args = {}) => {
  if (!args || typeof args !== "object" || Array.isArray(args)) return "arguments must be an object";
  if (name === "add_to_cart" || name === "remove_from_cart" || name === "check_inventory") {
    if (!args.productId || typeof args.productId !== "string") return "productId is required";
    if (!mongoose.Types.ObjectId.isValid(args.productId)) return "productId is invalid";
    if (!SIZES.has(String(args.size || "").toUpperCase())) return "a valid size is required";
  }
  if (name === "add_to_cart") {
    const quantity = Number(args.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return "quantity must be between 1 and 10";
  }
  if (name === "remove_from_cart" && (!args.productId || !args.size)) return "productId and size are required";
  if (name === "wishlist_product" && (!args.productId || typeof args.productId !== "string")) return "productId is required";
  if (name === "wishlist_product" && !mongoose.Types.ObjectId.isValid(args.productId)) return "productId is invalid";
  if (name === "get_product_details" && (!args.productId || typeof args.productId !== "string" || !mongoose.Types.ObjectId.isValid(args.productId))) return "productId is invalid";
  if (name === "compare_products" && (!Array.isArray(args.productIds) || args.productIds.length < 2 || args.productIds.length > 5 || args.productIds.some((id) => !mongoose.Types.ObjectId.isValid(id)))) return "compare_products requires 2 to 5 valid productIds";
  if (name === "search_products") {
    if (!args.query || typeof args.query !== "string" || args.query.length > 160) return "a concise search query is required";
    if (args.maxPrice != null && (!Number.isFinite(Number(args.maxPrice)) || Number(args.maxPrice) < 0)) return "maxPrice must be non-negative";
    if (args.minPrice != null && (!Number.isFinite(Number(args.minPrice)) || Number(args.minPrice) < 0)) return "minPrice must be non-negative";
    if (args.limit != null && (!Number.isInteger(Number(args.limit)) || Number(args.limit) < 1 || Number(args.limit) > 12)) return "limit must be between 1 and 12";
  }
  return null;
};

export const transitionState = (current = "DISCOVERY", next) => {
  if (!AGENT_STATES.has(next) || !allowedTransitions[current]?.has(next)) {
    throw new Error(`Invalid agent state transition: ${current} -> ${next}`);
  }
  return next;
};

export const isKnownTool = (name) => TOOL_NAMES.has(name);
