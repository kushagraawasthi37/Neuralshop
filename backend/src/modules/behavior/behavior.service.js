import { BehaviorEvent } from "./behavior.model.js";

export const trackEventService = async ({
  userId,
  sessionId,
  event,
  productId,
  metadata,
}) => {
  const doc = new BehaviorEvent({ userId, sessionId, event, productId, metadata });
  await doc.save();
  return doc;
};

export const getBehaviorEventsService = async (userId, sessionId, limit = 80) => {
  const query = userId
    ? { $or: [{ userId }, { sessionId }] }
    : { sessionId };

  return BehaviorEvent.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const buildBehaviorSummary = (events) => {
  const views = events.filter((e) => e.event === "product_view");
  const cartAdds = events.filter((e) => e.event === "add_to_cart");
  const searches = events.filter((e) => e.event === "search");
  const wishlistAdds = events.filter((e) => e.event === "wishlist_add");

  // Category frequency map
  const catCounts = {};
  for (const e of events) {
    const cat = e.metadata?.category;
    if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => ({ cat, count }));

  // Price range preference
  const prices = events
    .filter((e) => e.metadata?.price > 0)
    .map((e) => e.metadata.price);
  const avgPrice =
    prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;

  const recentSearches = [
    ...new Set(
      searches.map((e) => e.metadata?.searchQuery).filter(Boolean),
    ),
  ].slice(0, 5);

  const recentlyViewed = views.slice(0, 6).map((e) => ({
    name: e.metadata?.productName,
    category: e.metadata?.category,
    price: e.metadata?.price,
  }));

  return {
    totalEvents: events.length,
    viewCount: views.length,
    cartAddsCount: cartAdds.length,
    wishlistCount: wishlistAdds.length,
    topCategories,
    averagePriceViewed: avgPrice,
    recentSearches,
    recentlyViewed,
  };
};
