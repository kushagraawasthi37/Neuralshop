import { getBehaviorEventsService, buildBehaviorSummary } from "../behavior/behavior.service.js";
import { getCartService } from "../cart/cart.service.js";
import { getWishlistService } from "../wishlist/wishlist.service.js";
import prisma from "../../prisma/client.js";

export const buildAgentContext = async ({ userId, sessionId }) => {
  const [events, cart, wishlist, orders] = await Promise.all([
    getBehaviorEventsService(userId, sessionId, 50).catch(() => []),
    userId ? getCartService(userId).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    userId ? getWishlistService(userId).catch(() => ({ items: [] })) : Promise.resolve({ items: [] }),
    userId ? prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, totalAmount: true, createdAt: true, items: { select: { productId: true, size: true, quantity: true, price: true }, take: 10 } } }).catch(() => []) : Promise.resolve([]),
  ]);
  const summary = buildBehaviorSummary(events);
  const viewedPrices = (summary.recentlyViewed || []).map((item) => Number(item.price)).filter((price) => price > 0);
  const orderedSizes = orders.flatMap((order) => order.items.map((item) => item.size)).filter(Boolean);
  const sizeCounts = orderedSizes.reduce((counts, size) => ({ ...counts, [size]: (counts[size] || 0) + 1 }), {});
  return {
    constraints: {},
    historicalPreferences: {
      categories: summary.topCategories.slice(0, 3).map((entry) => entry.cat),
      priceRange: viewedPrices.length ? { min: Math.min(...viewedPrices), max: Math.max(...viewedPrices), average: summary.averagePriceViewed } : null,
      preferredSizes: Object.entries(sizeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([size]) => size),
      interactionFrequency: events.length,
      recentIntent: summary.recentSearches.slice(0, 5),
    },
    recentSearches: summary.recentSearches.slice(0, 5),
    recentlyViewed: summary.recentlyViewed.slice(0, 5).map(({ name, category, price }) => ({ name, category, price })),
    currentCart: (cart.items || []).slice(0, 10).map(({ productId, size, quantity, priceAtAdd, name }) => ({ productId, size, quantity, priceAtAdd, name })),
    wishlistProductIds: (wishlist.items || []).map((item) => String(item.productId?._id || item.productId)).slice(0, 20),
    previousOrders: orders.map((order) => ({ totalAmount: order.totalAmount, createdAt: order.createdAt, items: order.items })),
  };
};
