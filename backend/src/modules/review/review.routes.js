import express from "express";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  toggleReviewVisibility,
  respondToReview,
  deleteReviewAdmin,
} from "./review.controller.js";

const reviewRoutes = express.Router();

reviewRoutes.get("/product/:productId", getProductReviews);

reviewRoutes.post(
  "/product/:productId",
  isAuth,
  asyncHandler(async (req, res, next) => {
    if (!req.body.rating || !req.body.comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }
    next();
  }),
  createReview,
);

reviewRoutes.patch("/:reviewId", isAuth, updateReview);
reviewRoutes.delete("/:reviewId", isAuth, deleteReview);
reviewRoutes.post("/:reviewId/helpful", markHelpful);

reviewRoutes.get("/admin/all", isAuthAdmin, getAllReviews);

reviewRoutes.patch(
  "/admin/:reviewId/visibility",
  isAuthAdmin,
  toggleReviewVisibility,
);

reviewRoutes.delete("/admin/:reviewId", isAuthAdmin, deleteReviewAdmin);

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
