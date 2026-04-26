import mongoose from "mongoose";
import { Review } from "./review.model.js";
import { Product } from "./product.model.js";

// ============================================
// CREATE REVIEW
// ============================================
export const createReviewService = async (
  productId,
  userId,
  { rating, title, comment },
  verifiedPurchase = false,
) => {
  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      rating,
      title,
      comment,
      verifiedPurchase,
    });

    // Update product rating
    await updateProductRating(productId);

    return review;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET ALL REVIEWS FOR PRODUCT
// ============================================
export const getProductReviewsService = async (
  productId,
  { skip = 0, limit = 10, sortBy = "helpful" },
) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let sortOption = {};
    if (sortBy === "recent") {
      sortOption = { createdAt: -1 };
    } else if (sortBy === "rating_high") {
      sortOption = { rating: -1 };
    } else if (sortBy === "rating_low") {
      sortOption = { rating: 1 };
    } else {
      sortOption = { helpfulCount: -1 };
    }

    const reviews = await Review.find({
      productId,
      isVisible: true,
    })
      .populate("userId", "name profilePicture")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      productId,
      isVisible: true,
    });

    // Calculate rating stats
    const stats = await Review.aggregate([
      {
        $match: {
          productId: product._id,
          isVisible: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (stats.length > 0) {
      stats[0].ratingDistribution.forEach((r) => {
        ratingBreakdown[r]++;
      });
    }

    return {
      reviews,
      total,
      avgRating: stats[0]?.avgRating || 0,
      totalReviews: stats[0]?.totalReviews || 0,
      ratingBreakdown,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// UPDATE REVIEW
// ============================================
export const updateReviewService = async (
  reviewId,
  userId,
  { rating, title, comment },
) => {
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId.toString() !== userId) {
      throw new Error("Unauthorized: Cannot update another user's review");
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    await review.save();

    // Update product rating
    await updateProductRating(review.productId);

    return review;
  } catch (error) {
    throw error;
  }
};

// ============================================
// DELETE REVIEW
// ============================================
export const deleteReviewService = async (reviewId, userId) => {
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId.toString() !== userId) {
      throw new Error("Unauthorized: Cannot delete another user's review");
    }

    const productId = review.productId;
    await Review.deleteOne({ _id: reviewId });

    // Update product rating
    await updateProductRating(productId);

    return { message: "Review deleted successfully" };
  } catch (error) {
    throw error;
  }
};

// ============================================
// MARK REVIEW AS HELPFUL
// ============================================
export const markReviewHelpfulService = async (reviewId) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true },
    );

    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: GET ALL REVIEWS (for moderation)
// ============================================
export const getAllReviewsService = async ({ skip = 0, limit = 20 } = {}) => {
  try {
    const reviews = await Review.find()
      .populate("productId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments();

    return {
      reviews,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: HIDE/SHOW REVIEW
// ============================================
export const toggleReviewVisibilityService = async (reviewId, isVisible) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isVisible },
      { new: true },
    );

    if (!review) {
      throw new Error("Review not found");
    }

    // Update product rating
    await updateProductRating(review.productId);

    return review;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: RESPOND TO REVIEW
// ============================================
export const respondToReviewService = async (
  reviewId,
  adminId,
  { comment },
) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        adminResponse: {
          comment,
          respondedAt: new Date(),
          respondedBy: adminId,
        },
      },
      { new: true },
    );

    if (!review) {
      throw new Error("Review not found");
    }

    return review;
  } catch (error) {
    throw error;
  }
};

// ============================================
// HELPER: UPDATE PRODUCT RATING
// ============================================
const updateProductRating = async (productId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          isVisible: true,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};
