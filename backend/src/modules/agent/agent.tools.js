import { Product } from "../product/product.model.js";
import { listProductService, getProductByIdService } from "../product/product.service.js";
import { getPersonalizedRecommendationsService } from "../recommendation/recommendation.service.js";
import { getStockService } from "../inventory/inventory.service.js";
import { getCartService, addItemToCartService, removeCartItemService } from "../cart/cart.service.js";
import { addToWishlistService } from "../wishlist/wishlist.service.js";
import { createOrderService } from "../order/order.service.js";
import { buildAgentContext } from "./agent.context.service.js";
import { validateToolArguments } from "./agent.validator.js";

const cleanProduct = (product) => {
  if (!product) return null;
  const value = product.toObject ? product.toObject() : product;
  return { id: String(value._id || value.id), name: value.name, price: value.price, images: value.images || [], category: value.category, subCategory: value.subCategory, rating: value.rating || 0, reviewCount: value.reviewCount || 0, sizes: value.sizes || [] };
};

const search = async (args) => {
  const result = await listProductService({ search: args.query, category: args.category, priceMax: args.maxPrice, priceMin: args.minPrice, limit: Math.min(Number(args.limit) || 8, 12), sort: "rating_desc" });
  const products = (result.products || []).filter((product) => !args.size || product.sizes?.some((entry) => String(entry.size).toUpperCase() === String(args.size).toUpperCase()));
  return { products: products.map(cleanProduct), total: result.total, reason: "Matches catalog intent, budget, and requested size where available." };
};

export const agentTools = {
  search_products: search,
  get_product_details: async ({ productId }) => ({ product: cleanProduct(await getProductByIdService(productId)) }),
  get_user_context: async (_, ctx) => ({ context: await buildAgentContext(ctx) }),
  get_recommendations: async (args, ctx) => {
    const products = await getPersonalizedRecommendationsService(ctx.userId, ctx.sessionId, { limit: Math.min(Number(args.limit) || 6, 10) });
    let filtered = products.filter((product) => {
      if (args.maxPrice != null && product.price > Number(args.maxPrice)) return false;
      if (args.minPrice != null && product.price < Number(args.minPrice)) return false;
      if (args.category && String(product.category).toLowerCase() !== String(args.category).toLowerCase()) return false;
      if (args.size && !product.sizes?.some((entry) => String(entry.size).toUpperCase() === String(args.size).toUpperCase())) return false;
      return true;
    });
    if (args.size) {
      const checks = await Promise.all(filtered.map(async (product) => {
        try {
          const stock = await agentTools.check_inventory({ productId: String(product._id), size: args.size }, ctx);
          return stock.availableStock > 0 ? product : null;
        } catch { return null; }
      }));
      filtered = checks.filter(Boolean);
    }
    return { products: filtered.map(cleanProduct), reason: "Ranked after deterministic budget, category, and size constraints, then behavioral signals and ratings." };
  },
  compare_products: async ({ productIds }) => {
    const products = await Product.find({ _id: { $in: productIds.slice(0, 5) } }).lean();
    return { products: products.map(cleanProduct).sort((a, b) => (b.rating || 0) - (a.rating || 0)) };
  },
  check_inventory: async ({ productId, size }) => {
    const product = await Product.findById(productId).select("owner name").lean();
    if (!product) throw new Error("Product not found");
    return { productId, size: size.toUpperCase(), ...(await getStockService(String(product.owner), productId, size.toUpperCase())) };
  },
  add_to_cart: async ({ productId, size, quantity = 1 }, ctx) => {
    if (!ctx.userId) throw new Error("Sign in before adding items to the server cart");
    const product = await Product.findById(productId).lean();
    if (!product) throw new Error("Product not found");
    const selected = product.sizes?.find((entry) => String(entry.size).toUpperCase() === size.toUpperCase());
    if (!selected) throw new Error(`Size ${size.toUpperCase()} is not offered for this product`);
    const stock = await agentTools.check_inventory({ productId, size }, ctx);
    if (stock.availableStock < Number(quantity)) throw new Error(`That item is unavailable in ${size.toUpperCase()}`);
    return addItemToCartService(ctx.userId, { productId, size, quantity: Number(quantity), priceAtAdd: product.price, name: product.name, image: product.images?.[0] });
  },
  remove_from_cart: async ({ productId, size }, ctx) => {
    if (!ctx.userId) throw new Error("Sign in to modify your cart");
    return removeCartItemService(ctx.userId, productId, size);
  },
  wishlist_product: async ({ productId }, ctx) => {
    if (!ctx.userId) throw new Error("Sign in to use your wishlist");
    return addToWishlistService(ctx.userId, productId);
  },
  prepare_order: async ({ addressId } = {}, ctx) => {
    if (!ctx.userId) throw new Error("Sign in before preparing checkout");
    const address = addressId || ctx.addressId;
    if (!address) return { orderReady: false, requiresAddress: true, message: "Choose a saved delivery address before I prepare checkout." };
    const cart = await getCartService(ctx.userId).catch(() => ({ items: [] }));
    const result = await createOrderService(ctx.userId, address, ctx.idempotencyKey);
    return { orderReady: true, orderId: result.orderId, amount: result.totalAmount, items: cart.items || [] };
  },
};

export const executeAgentTool = async (call, context) => {
  const started = Date.now();
  const error = validateToolArguments(call.name, call.arguments);
  if (error) return { success: false, tool: call.name, error: { code: "INVALID_ARGUMENTS", message: error }, retryable: false, metadata: { latencyMs: Date.now() - started } };
  const tool = agentTools[call.name];
  if (!tool) return { success: false, tool: call.name, error: { code: "UNKNOWN_TOOL", message: "Unknown agent tool" }, retryable: false, metadata: { latencyMs: Date.now() - started } };
  try {
    const data = await tool(call.arguments, context);
    return { success: true, tool: call.name, data, metadata: { latencyMs: Date.now() - started } };
  } catch (error) {
    return { success: false, tool: call.name, error: { code: error.code || "TOOL_FAILED", message: error.message }, retryable: ["ECONNRESET", "ETIMEDOUT"].includes(error.code) || /timeout|unavailable/i.test(error.message), metadata: { latencyMs: Date.now() - started } };
  }
};
