import { Product } from "../product/product.model.js";
import { callGroq } from "../../utils/groq.js";
import {
  getBehaviorEventsService,
  buildBehaviorSummary,
} from "../behavior/behavior.service.js";

export const getSimilarProductsService = async (
  productId,
  { limit = 10 } = {},
) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  return Product.find({
    _id: { $ne: productId },
    category: product.category,
  })
    .limit(limit)
    .select(
      "name price images category subCategory rating reviewCount bestseller",
    );
};

export const getRelatedProductsService = async (
  productId,
  { limit = 10 } = {},
) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  return Product.find({
    _id: { $ne: productId },
    $or: [
      { tags: { $in: product.tags } },
      { category: product.category },
      { subCategory: product.subCategory },
    ],
  })
    .limit(limit)
    .select(
      "name price images category subCategory rating reviewCount bestseller",
    );
};

export const getRecommendedProductsService = async (
  userId = null,
  { limit = 10 } = {},
) => {
  let recommendedProducts = [];

  if (userId) {
    // reserved for future personalization
  }

  if (recommendedProducts.length < limit) {
    const bestsellers = await Product.find({
      bestseller: true,
    })
      .limit(limit)
      .select(
        "name price images category subCategory rating reviewCount bestseller",
      );

    recommendedProducts = [...recommendedProducts, ...bestsellers].slice(
      0,
      limit,
    );
  }

  return recommendedProducts;
};

export const getTopRatedProductsService = async ({ limit = 10 } = {}) => {
  return Product.find({
    rating: { $gt: 0 },
  })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .select(
      "name price images category subCategory rating reviewCount bestseller",
    );
};

export const getTrendingProductsService = async ({ limit = 10 } = {}) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return Product.find({
    updatedAt: { $gte: sevenDaysAgo },
  })
    .sort({ reviewCount: -1, rating: -1 })
    .limit(limit)
    .select(
      "name price images category subCategory rating reviewCount bestseller updatedAt",
    );
};

export const getYouMayLikeService = async (productId, { limit = 10 } = {}) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  return Product.find({
    _id: { $ne: productId },
    $or: [
      { tags: { $in: product.tags } },
      { category: product.category },
      { subCategory: product.subCategory },
    ],
    price: {
      $gte: product.price * 0.7,
      $lte: product.price * 1.3,
    },
  })
    .sort({ rating: -1 })
    .limit(limit)
    .select(
      "name price images category subCategory rating reviewCount bestseller",
    );
};

export const getPersonalizedRecommendationsService = async (
  userId,
  sessionId,
  { limit = 10 } = {},
) => {
  try {
    const events = await getBehaviorEventsService(userId, sessionId, 80);

    if (events.length < 3) {
      return getRecommendedProductsService(null, { limit });
    }

    const summary = buildBehaviorSummary(events);

    const topCats = summary.topCategories.map((c) => c.cat).filter(Boolean);
    const candidateFilter =
      topCats.length > 0 ? { category: { $in: topCats } } : {};

    const candidates = await Product.find(candidateFilter)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(50)
      .select(
        "_id name price images category subCategory rating reviewCount bestseller sizes",
      )
      .lean();

    if (candidates.length === 0) {
      return getRecommendedProductsService(null, { limit });
    }

    const systemPrompt =
      "You are a luxury fashion AI recommendation engine for NeuralShop. " +
      "Analyze user behavior and return the best product IDs in order of relevance. " +
      "Return only valid JSON.";

    const userPrompt =
      `User behavior summary:\n${JSON.stringify(summary, null, 2)}\n\n` +
      `Candidate products (id | name | category | price | rating):\n` +
      candidates
        .slice(0, 40)
        .map(
          (p) =>
            `${p._id} | ${p.name} | ${p.category} | ₹${p.price} | ★${p.rating}`,
        )
        .join("\n") +
      `\n\nReturn JSON: {"recommendedIds": ["id1","id2",...], "reason": "brief explanation"}` +
      `\nPick the top ${limit} most relevant IDs.`;

    let ids = [];
    try {
      const raw = await callGroq(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0.2, maxTokens: 600 },
      );
      const parsed = JSON.parse(raw);
      ids = (parsed.recommendedIds || []).slice(0, limit);
    } catch (_) {
      return candidates.slice(0, limit);
    }

    const map = Object.fromEntries(candidates.map((p) => [String(p._id), p]));
    const ordered = ids.map((id) => map[id]).filter(Boolean);

    if (ordered.length < limit) {
      const seen = new Set(ordered.map((p) => String(p._id)));
      for (const p of candidates) {
        if (ordered.length >= limit) break;
        if (!seen.has(String(p._id))) ordered.push(p);
      }
    }

    return ordered;
  } catch (error) {
    return getRecommendedProductsService(null, { limit });
  }
};
