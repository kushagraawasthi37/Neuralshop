import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  getSimilarProducts,
  getRelatedProducts,
  getRecommended,
  getTopRated,
  getTrending,
  getYouMayLike,
  getPersonalized,
} from "./recommendation.controller.js";
import { cacheMiddleware } from "../../middlewares/cache.middleware.js";

const recommendationRoutes = express.Router();

// Get similar products for a specific product
recommendationRoutes.get(
  "/similar/:productId",
  cacheMiddleware((req) => `similar:${req.params.productId}`, 1800),
  getSimilarProducts,
);

// Get related products for a specific product
recommendationRoutes.get(
  "/related/:productId",
  cacheMiddleware((req) => `related:${req.params.productId}`, 1800),
  getRelatedProducts,
);

// Get top rated products
recommendationRoutes.get(
  "/top-rated",
  cacheMiddleware(() => "top_rated_products", 3600),
  getTopRated,
);

// Get trending products
recommendationRoutes.get(
  "/trending",
  cacheMiddleware(() => "trending_products", 21600),
  getTrending,
);

// Get "you may like" products for a specific product
recommendationRoutes.get(
  "/you-may-like/:productId",
  cacheMiddleware((req) => `you_may_like:${req.params.productId}`, 1800),
  getYouMayLike,
);

// Get recommended products (bestsellers or category-based)
recommendationRoutes.get(
  "/",
  cacheMiddleware(() => "recommended_products", 1800),
  getRecommended,
);

// Get personalized recommendations (user must be logged in)
recommendationRoutes.get("/personalized", isAuth, getPersonalized);

export default recommendationRoutes;
