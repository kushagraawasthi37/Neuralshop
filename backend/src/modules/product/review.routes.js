import express from "express";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { validationErrorHandler } from "../../middlewares/validation.middleware.js";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  toggleReviewVisibility,
  respondToReview,
} from "./review.controller.js";

const reviewRoutes = express.Router();

// ============================================
// USER ROUTES
// ============================================

// Get all reviews for a product
reviewRoutes.get("/product/:productId", getProductReviews);

// Create review for product
reviewRoutes.post(
  "/product/:productId",
  isAuth,
  asyncHandler(async (req, res, next) => {
    if (!req.body.rating || !req.body.title || !req.body.comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    next();
  }),
  createReview,
);

// Update own review
reviewRoutes.patch("/:reviewId", isAuth, updateReview);

// Delete own review
reviewRoutes.delete("/:reviewId", isAuth, deleteReview);

// Mark review as helpful
reviewRoutes.post("/:reviewId/helpful", markHelpful);

// ============================================
// ADMIN ROUTES (Moderation)
// ============================================

// Get all reviews for moderation
reviewRoutes.get("/admin/all", isAuthAdmin, getAllReviews);

// Hide/show review
reviewRoutes.patch(
  "/admin/:reviewId/visibility",
  isAuthAdmin,
  toggleReviewVisibility,
);

// Respond to review
reviewRoutes.post(
  "/admin/:reviewId/respond",
  isAuthAdmin,
  asyncHandler(async (req, res, next) => {
    if (!req.body.comment) {
      return res.status(400).json({ message: "Comment is required" });
    }
    next();
  }),
  respondToReview,
);

export default reviewRoutes;
