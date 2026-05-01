import { Product } from "./product.model.js";
import mongoose from "mongoose";

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
// PERSONALIZED RECOMMENDATIONS (Future: AI/ML)
// ============================================
export const getPersonalizedRecommendationsService = async (
  userId,
  { limit = 10 } = {},
) => {
  try {
    // This is a placeholder for future ML-based recommendations
    // For now, return top-rated products from various categories

    const recommendations = await Product.aggregate([
      { $match: { rating: { $gt: 3 } } },
      { $group: { _id: "$category", products: { $push: "$$ROOT" } } },
      { $limit: limit },
    ]);

    return recommendations;
  } catch (error) {
    throw error;
  }
};
