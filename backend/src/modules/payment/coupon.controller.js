import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  createCouponService,
  getAllCouponsService,
  getCouponByCodeService,
  validateCouponService,
  applyCouponToOrderService,
  updateCouponService,
  deleteCouponService,
  toggleCouponStatusService,
} from "./coupon.service.js";

// ============================================
// USER ENDPOINTS
// ============================================

// Validate coupon before checkout
export const validateCoupon = asyncHandler(async (req, res) => {
  const { couponCode, orderAmount } = req.body;

  if (!couponCode || !orderAmount) {
    throw new ApiError(
      400,
      "Coupon code and order amount required",
      [],
      "coupon",
    );
  }

  const result = await validateCouponService(
    couponCode,
    orderAmount,
    req.userId,
  );

  // console.log("Coupon validation result:", result.finalAmount);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Coupon validated successfully"));
});

// Get coupon info
export const getCoupon = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new ApiError(400, "Coupon code required", [], "coupon");
  }

  const coupon = await getCouponByCodeService(code);

  res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon retrieved successfully"));
});

// Apply coupon to order (called during payment)
export const applyCouponToOrder = asyncHandler(async (req, res) => {
  const { orderId, couponCode } = req.body;

  if (!orderId || !couponCode) {
    throw new ApiError(400, "Order ID and coupon code required", [], "coupon");
  }

  const result = await applyCouponToOrderService(orderId, couponCode);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Coupon applied successfully"));
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Create coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    maxUsesPerUser,
    startDate,
    expiryDate,
  } = req.body;

  const coupon = await createCouponService({
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    maxUsesPerUser,
    startDate,
    expiryDate,
  });

  res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

// Get all coupons
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 20 } = req.query;

  const result = await getAllCouponsService({
    skip: parseInt(skip),
    limit: parseInt(limit),
  });

  res
    .status(200)
    .json(new ApiResponse(200, result, "Coupons retrieved successfully"));
});

// Update coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const updateData = req.body;

  const coupon = await updateCouponService(couponId, updateData);

  res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

// Delete coupon
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const result = await deleteCouponService(couponId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Coupon deleted successfully"));
});

// Toggle coupon active status
export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const { isActive } = req.body;

  console.log("Toggling coupon status:", { couponId, isActive });

  const coupon = await toggleCouponStatusService(couponId, isActive);

  res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon status updated successfully"));
});
