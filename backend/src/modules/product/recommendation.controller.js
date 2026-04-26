import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  getSimilarProductsService,
  getRelatedProductsService,
  getRecommendedProductsService,
  getTopRatedProductsService,
  getTrendingProductsService,
  getYouMayLikeService,
  getPersonalizedRecommendationsService,
} from "./recommendation.service.js";

// Get similar products for a product
export const getSimilarProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 10 } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required", [], "product");
  }

  const similar = await getSimilarProductsService(productId, {
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, similar, "Similar products retrieved successfully"),
    );
});

// Get related products
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 10 } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required", [], "product");
  }

  const related = await getRelatedProductsService(productId, {
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, related, "Related products retrieved successfully"),
    );
});

// Get recommended products
export const getRecommended = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const userId = req.userId || null;

  const recommended = await getRecommendedProductsService(userId, {
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        recommended,
        "Recommended products retrieved successfully",
      ),
    );
});

// Get top rated products
export const getTopRated = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topRated = await getTopRatedProductsService({
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(new ApiResponse(200, topRated, "Top rated products retrieved"));
});

// Get trending products
export const getTrending = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const trending = await getTrendingProductsService({
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        trending,
        "Trending products retrieved successfully",
      ),
    );
});

// Get "you may like" products
export const getYouMayLike = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 10 } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required", [], "product");
  }

  const mayLike = await getYouMayLikeService(productId, {
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(new ApiResponse(200, mayLike, "You may like products retrieved"));
});

// Get personalized recommendations
export const getPersonalized = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const userId = req.userId;

  if (!userId) {
    throw new ApiError(400, "User must be logged in", [], "product");
  }

  const personalized = await getPersonalizedRecommendationsService(userId, {
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        personalized,
        "Personalized recommendations retrieved",
      ),
    );
});
