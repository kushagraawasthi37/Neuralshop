import { ApiError } from "../../utils/api-error.js";
import ApiResponse from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createOrderService,
  getOrdersService,
  getOrderByIdService,
  cancelOrderService,
} from "./order.service.js";

/*
 * POST /orders - Create new order
 * ♻️ Idempotency protected via header
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  if (!addressId) {
    throw new ApiError(400, "Address ID is required", [], "order");
  }

  const result = await createOrderService(
    req.userId,
    addressId,
    idempotencyKey,
  );

  res
    .status(201)
    .json(new ApiResponse(201, result, "Order created successfully"));
});

/**
 * GET /orders - Get user's orders
 */
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await getOrdersService(req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

/**
 * GET /orders/:orderId - Get specific order
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await getOrderByIdService(req.userId, orderId);

  res
    .status(200)
    .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

/**
 * PATCH /orders/:orderId/cancel - Cancel order
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const result = await cancelOrderService(req.userId, orderId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Order cancelled successfully"));
});
