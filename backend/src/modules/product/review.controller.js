import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  createReviewService,
  getProductReviewsService,
  updateReviewService,
  deleteReviewService,
  markReviewHelpfulService,
  getAllReviewsService,
  toggleReviewVisibilityService,
  respondToReviewService,
} from "./review.service.js";

// Checked
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await createReviewService(productId, req.userId, {
    rating,
    title,
    comment,
  });

  res
    .status(201)
    .json(new ApiResponse(201, review, "Review created successfully"));
});

// Checked
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { skip = 0, limit = 10, sortBy = "helpful" } = req.query;

  const result = await getProductReviewsService(productId, {
    skip: parseInt(skip),
    limit: parseInt(limit),
    sortBy,
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Reviews retrieved successfully"));
});

// Checked
export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await updateReviewService(reviewId, req.userId, {
    rating,
    title,
    comment,
  });

  res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

// Checked
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const result = await deleteReviewService(reviewId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Review deleted successfully"));
});

// Checked
export const markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await markReviewHelpfulService(reviewId);

  res
    .status(200)
    .json(new ApiResponse(200, review, "Review marked as helpful"));
});

// Admin: Get all reviews (for moderation)
export const getAllReviews = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 20 } = req.query;

  const result = await getAllReviewsService({
    skip: parseInt(skip),
    limit: parseInt(limit),
  });

  res.status(200).json(new ApiResponse(200, result, "All reviews retrieved"));
});

// Admin: Hide/show review
export const toggleReviewVisibility = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { isVisible } = req.body;

  const review = await toggleReviewVisibilityService(reviewId, isVisible);

  res
    .status(200)
    .json(new ApiResponse(200, review, "Review visibility toggled"));
});

// Admin: Respond to review
export const respondToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;

  const review = await respondToReviewService(reviewId, req.adminId, {
    comment,
  });

  res
    .status(200)
    .json(new ApiResponse(200, review, "Response added to review"));
});
