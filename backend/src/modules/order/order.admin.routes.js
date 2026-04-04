import express from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  getSellerOrdersService,
  getSellerOrderByIdService,
  updateOrderItemStatusService,
  bulkUpdateOrderItemStatusService,
} from "./order.service.js";
import { validateOrderItemStatusUpdate } from "./order.validation.js";

const router = express.Router();

// ============================================
// 🔐 SELLER ORDER MANAGEMENT
// ============================================

/**
 * GET /admin/orders
 * Get all orders for authenticated seller
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new ApiError(401, "Unauthorized", [], "order");
    }

    const orders = await getSellerOrdersService(sellerId);
    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
  }),
);

/**
 * GET /admin/orders/:orderId
 * Get specific order for seller (filtered to seller's items)
 */
router.get(
  "/:orderId",
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new ApiError(401, "Unauthorized", [], "order");
    }

    const order = await getSellerOrderByIdService(sellerId, orderId);
    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order retrieved successfully"));
  }),
);

/**
 * PATCH /admin/order-items/:itemId/status
 * Update OrderItem status with seller validation
 * Body: { status: "SHIPPED" | "DELIVERED" | "PROCESSING" | "CANCELLED" }
 */
router.patch(
  "/order-items/:itemId/status",
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { status } = req.body;
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new ApiError(401, "Unauthorized", [], "order");
    }

    // Validate input
    validateOrderItemStatusUpdate({ status });

    const result = await updateOrderItemStatusService(
      sellerId,
      itemId,
      status.toUpperCase(),
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Order item status updated successfully"),
      );
  }),
);

/**
 * PATCH /admin/order-items/bulk/status
 * Bulk update multiple items' status
 * Body: { updates: [ { itemId: "...", status: "SHIPPED" }, ... ] }
 */
router.patch(
  "/bulk/status",
  asyncHandler(async (req, res) => {
    const { updates } = req.body;
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new ApiError(401, "Unauthorized", [], "order");
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new ApiError(400, "Updates array is required", [], "order");
    }

    const result = await bulkUpdateOrderItemStatusService(sellerId, updates);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Bulk status update completed"));
  }),
);

export default router;
