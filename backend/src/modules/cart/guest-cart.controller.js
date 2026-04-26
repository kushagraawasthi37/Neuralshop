import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  createGuestCartService,
  getGuestCartService,
  updateGuestCartService,
  addToGuestCartService,
  removeFromGuestCartService,
  clearGuestCartService,
  deleteGuestCartService,
  migrateGuestCartToUserService,
} from "./guest-cart.service.js";

// Create/Initialize guest cart
export const initGuestCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required", [], "cart");
  }

  const guestCart = await createGuestCartService(sessionId);

  res.status(201).json(new ApiResponse(201, guestCart, "Guest cart created"));
});

// Get guest cart
export const getGuestCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required", [], "cart");
  }

  const guestCart = await getGuestCartService(sessionId);

  if (!guestCart) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Guest cart not found or expired"));
  }

  res.status(200).json(new ApiResponse(200, guestCart, "Guest cart retrieved"));
});

// Add item to guest cart
export const addToGuestCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;
  const { productId, size, quantity, price, name, image } = req.body;

  if (!sessionId || !productId || !size || !quantity) {
    throw new ApiError(
      400,
      "Session ID, product ID, size, and quantity are required",
      [],
      "cart",
    );
  }

  const guestCart = await addToGuestCartService(sessionId, {
    productId,
    size,
    quantity: parseInt(quantity),
    price: parseFloat(price),
    name,
    image,
  });

  res
    .status(200)
    .json(new ApiResponse(200, guestCart, "Item added to guest cart"));
});

// Remove item from guest cart
export const removeFromGuestCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;
  const { productId, size } = req.body;

  if (!sessionId || !productId || !size) {
    throw new ApiError(
      400,
      "Session ID, product ID, and size are required",
      [],
      "cart",
    );
  }

  const guestCart = await removeFromGuestCartService(
    sessionId,
    productId,
    size,
  );

  res
    .status(200)
    .json(new ApiResponse(200, guestCart, "Item removed from guest cart"));
});

// Clear guest cart
export const clearGuestCartEndpoint = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required", [], "cart");
  }

  const guestCart = await clearGuestCartService(sessionId);

  res.status(200).json(new ApiResponse(200, guestCart, "Guest cart cleared"));
});

// Delete guest cart
export const deleteGuestCartEndpoint = asyncHandler(async (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required", [], "cart");
  }

  const result = await deleteGuestCartService(sessionId);

  res.status(200).json(new ApiResponse(200, result, "Guest cart deleted"));
});

// Migrate guest cart to user cart (after login)
export const migrateGuestCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required", [], "cart");
  }

  const result = await migrateGuestCartToUserService(sessionId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Guest cart migrated to user cart"));
});
