import { Product } from "./product.model.js";
import mongoose from "mongoose";
import { callGroq } from "../../utils/groq.js";
import {
  getBehaviorEventsService,
  buildBehaviorSummary,
} from "../behavior/behavior.service.js";

// ============================================
// GET SIMILAR PRODUCTS (by category)
// ============================================
export const getSimilarProductsService = async (
  productId,
  { limit = 10 } = {},
) => {
  try {
    // Get the base product
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    console.log("Similar products query:", {
      productId,
      category: product.category,
      limit,
    });

    // Find similar products in same category
    const similarProducts = await Product.find({
      _id: { $ne: productId }, // Exclude current product
      category: product.category,
    })
      .limit(limit)
      .select(
        "name price images category subCategory rating reviewCount bestseller",
      );

    console.log("Similar products found:", similarProducts);

    return similarProducts;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET RELATED PRODUCTS (by tags/category)
// ============================================
export const getRelatedProductsService = async (
  productId,
  { limit = 10 } = {},
) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Find products by matching tags or category
    const relatedProducts = await Product.find({
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

    return relatedProducts;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET RECOMMENDED PRODUCTS (based on category/bestsellers)
// ============================================
export const getRecommendedProductsService = async (
  userId = null,
  { limit = 10 } = {},
) => {
  try {
    // If user exists, find products from categories they've bought
    let recommendedProducts = [];

    if (userId) {
      // This requires access to orders - implement if needed
      // For now, show bestsellers
    }

    // Default: return bestselling products
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
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET TOP RATED PRODUCTS
// ============================================
export const getTopRatedProductsService = async ({ limit = 10 } = {}) => {
  try {
    const topRated = await Product.find({
      rating: { $gt: 0 },
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .select(
        "name price images category subCategory rating reviewCount bestseller",
      );

    return topRated;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET TRENDING PRODUCTS
// ============================================
export const getTrendingProductsService = async ({ limit = 10 } = {}) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Products with high reviews in last 7 days
    const trending = await Product.find({
      updatedAt: { $gte: sevenDaysAgo },
    })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(limit)
      .select(
        "name price images category subCategory rating reviewCount bestseller updatedAt",
      );

    return trending;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET PRODUCTS YOU MAY LIKE (category-based)
// ============================================
export const getYouMayLikeService = async (productId, { limit = 10 } = {}) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Get products from same category but different price range
    const similar = await Product.find({
      _id: { $ne: productId },
      $or: [
        { tags: { $in: product.tags } },
        { category: product.category },
        { subCategory: product.subCategory },
      ],
      price: {
        $gte: product.price * 0.7, // 70% of current price
        $lte: product.price * 1.3, // 130% of current price
      },
    })
      .sort({ rating: -1 })
      .limit(limit)
      .select(
        "name price images category subCategory rating reviewCount bestseller",
      );

    return similar;
  } catch (error) {
    throw error;
  }
};

// ============================================
// PERSONALIZED RECOMMENDATIONS (Groq AI)
// ============================================
export const getPersonalizedRecommendationsService = async (
  userId,
  sessionId,
  { limit = 10 } = {},
) => {
  try {
    // Fetch user behavior events
    const events = await getBehaviorEventsService(userId, sessionId, 80);

    if (events.length < 3) {
      // Not enough data — return bestsellers as cold-start fallback
      return getRecommendedProductsService(null, { limit });
    }

    const summary = buildBehaviorSummary(events);

    // Pre-filter candidates by top-interest categories
    const topCats = summary.topCategories.map((c) => c.cat).filter(Boolean);
    const candidateFilter =
      topCats.length > 0 ? { category: { $in: topCats } } : {};

    const candidates = await Product.find(candidateFilter)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(50)
      .select("_id name price images category subCategory rating reviewCount bestseller sizes")
      .lean();

    if (candidates.length === 0) {
      return getRecommendedProductsService(null, { limit });
    }

    // Ask Groq to rank candidates based on user behavior
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
      // Groq failed or hit rate limit — fall back to top-rated candidates
      return candidates.slice(0, limit);
    }

    // Hydrate in the recommended order
    const map = Object.fromEntries(candidates.map((p) => [String(p._id), p]));
    const ordered = ids.map((id) => map[id]).filter(Boolean);

    // Pad with candidates if Groq returned fewer than limit
    if (ordered.length < limit) {
      const seen = new Set(ordered.map((p) => String(p._id)));
      for (const p of candidates) {
        if (ordered.length >= limit) break;
        if (!seen.has(String(p._id))) ordered.push(p);
      }
    }

    return ordered;
  } catch (error) {
    // Ultimate fallback
    return getRecommendedProductsService(null, { limit });
  }
};
