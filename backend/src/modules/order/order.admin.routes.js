import express from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import { isAuthAdmin } from "../../middlewares/auth.middleware.js";
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

/** Checked
 * GET /admin/orders
 * Get all orders for authenticated seller
 */

router.get(
  "/",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const sellerId = req.adminId;

    if (!sellerId) {
      throw new ApiError(401, "Unauthorized", [], "order");
    }

    const orders = await getSellerOrdersService(sellerId);
    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
  }),
);

/** Checked
 * GET /admin/orders/:orderId
 * Get specific order for seller (filtered to seller's items)
 */
router.get(
  "/:orderId",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const sellerId = req.adminId;
    if (!sellerId) {
      throw new ApiError(401, "Unauthorized", [], "order");
    }

    const order = await getSellerOrderByIdService(sellerId, orderId);
    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order retrieved successfully"));
  }),
);

/** Checked
 * PATCH /admin/order-items/:itemId/status
 * Update OrderItem status with seller validation
 * Body: { status: "SHIPPED" | "DELIVERED" | "PROCESSING" | "CANCELLED" }
 */
router.patch(
  "/order-items/:itemId/status",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { status } = req.body;
    const sellerId = req.adminId;
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

/**  Checked
 * PATCH /admin/order-items/bulk/status
 * Bulk update multiple items' status
 * Body: { updates: [ { itemId: "...", status: "SHIPPED" }, ... ] }
 */
router.patch(
  "/bulk/status",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const { updates } = req.body;
    const sellerId = req.adminId;
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
