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

const recommendationRoutes = express.Router();

// Get similar products for a specific product
recommendationRoutes.get("/similar/:productId", getSimilarProducts);

// Get related products for a specific product
recommendationRoutes.get("/related/:productId", getRelatedProducts);

// Get top rated products
recommendationRoutes.get("/top-rated", getTopRated);

// Get trending products
recommendationRoutes.get("/trending", getTrending);

// Get "you may like" products for a specific product
recommendationRoutes.get("/you-may-like/:productId", getYouMayLike);

// Get recommended products (bestsellers or category-based)
recommendationRoutes.get("/", getRecommended);

// Get personalized recommendations (user must be logged in)
recommendationRoutes.get("/personalized", isAuth, getPersonalized);

export default recommendationRoutes;
