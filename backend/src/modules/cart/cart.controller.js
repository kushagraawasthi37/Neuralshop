import {
  getCartService,
  addItemToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  validateCartService,
  checkoutCartService,
  syncCartService,
  mergeCartService,
  getCartSummaryService,
} from "./cart.service.js";
import ApiResponse from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

export const addItem = asyncHandler(async (req, res) => {
  let { productId, size, quantity, priceAtAdd, name, image } = req.body;

  quantity = Number(quantity);
  priceAtAdd = Number(priceAtAdd);

  const cart = await addItemToCartService(req.userId, {
    productId,
    size,
    quantity,
    priceAtAdd,
    name,
    image,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, cart, "Item added to cart successfully"));
});

export const updateItem = asyncHandler(async (req, res) => {
  let { productId, size, quantity } = req.body;
  quantity = Number(quantity);
  const cart = await updateCartItemService(req.userId, productId, size, quantity);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
});

export const removeItem = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const cart = await removeCartItemService(req.userId, productId, size);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart successfully"));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await clearCartService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

export const validateCart = asyncHandler(async (req, res) => {
  const result = await validateCartService(req.userId);
  return res.status(200).json(new ApiResponse(200, result, "Cart validated"));
});

export const checkout = asyncHandler(async (req, res) => {
  const orderPayload = await checkoutCartService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, { order: orderPayload }, "Checkout successful"));
});

export const syncCart = asyncHandler(async (req, res) => {
  const cart = await syncCartService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart synced successfully"));
});

// For future use: merge guest cart with user cart after login
export const mergeCart = asyncHandler(async (req, res) => {
  const { guestCart } = req.body;
  const cart = await mergeCartService(req.userId, guestCart);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart merged successfully"));
});

export const summary = asyncHandler(async (req, res) => {
  const summaryResponse = await getCartSummaryService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, summaryResponse, "Cart summary retrieved"));
});
