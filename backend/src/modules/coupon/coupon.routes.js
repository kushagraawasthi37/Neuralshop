import express from "express";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import {
  validateCoupon,
  getCoupon,
  applyCouponToOrder,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "./coupon.controller.js";

const couponRoutes = express.Router();

// ============================================
// USER ROUTES
// ============================================

// Validate coupon before checkout
couponRoutes.post("/validate", isAuth, validateCoupon);

// Get coupon info
couponRoutes.get("/:code", getCoupon);

// Apply coupon to order
couponRoutes.post("/:orderId/apply", isAuth, applyCouponToOrder);

// ============================================
// ADMIN ROUTES
// ============================================

// Create coupon
couponRoutes.post("/admin/create", isAuthAdmin, createCoupon);

// Get all coupons
couponRoutes.get("/admin/all", isAuthAdmin, getAllCoupons);

// Update coupon
couponRoutes.patch("/admin/:couponId", isAuthAdmin, updateCoupon);

// Toggle coupon status
couponRoutes.patch("/admin/:couponId/toggle", isAuthAdmin, toggleCouponStatus);

// Delete coupon
couponRoutes.delete("/admin/:couponId", isAuthAdmin, deleteCoupon);

export default couponRoutes;
