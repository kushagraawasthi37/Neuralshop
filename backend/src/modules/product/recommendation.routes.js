import express from "express";
import jwt from "jsonwebtoken";
import config from "../../config/environment.config.js";
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

const softAuth = (req, _res, next) => {
  const authHeader = req.header("Authorization");
  const token =
    req.cookies?.userToken ||
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1].trim() : null);
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded?.userId;
    } catch (_) {}
  }
  next();
};

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

// Get personalized recommendations (logged-in users + guests via sessionId)
recommendationRoutes.get("/personalized", softAuth, getPersonalized);

export default recommendationRoutes;
