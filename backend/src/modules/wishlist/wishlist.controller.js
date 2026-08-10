import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  getWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  isInWishlistService,
  clearWishlistService,
} from "./wishlist.service.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getWishlistService(req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist retrieved successfully"));
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required", [], "wishlist");
  }

  const wishlist = await addToWishlistService(req.userId, productId);

  res
    .status(201)
    .json(new ApiResponse(201, wishlist, "Item added to wishlist"));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required", [], "wishlist");
  }

  const wishlist = await removeFromWishlistService(req.userId, productId);

  res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Item removed from wishlist"));
});

export const checkInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    throw new ApiError(400, "Product ID is required", [], "wishlist");
  }

  const inWishlist = await isInWishlistService(req.userId, productId);

  res.status(200).json(new ApiResponse(200, { inWishlist }, "Check completed"));
});

export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await clearWishlistService(req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist cleared successfully"));
});
