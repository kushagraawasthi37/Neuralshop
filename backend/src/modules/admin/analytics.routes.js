import express from "express";
import { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import {
  getDashboardStats,
  getSalesAnalytics,
  getPaymentAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getOrderStatusDistribution,
  getCouponAnalytics,
  getSellerAnalytics,
} from "./analytics.controller.js";

const analyticsRoutes = express.Router();

// All analytics endpoints require admin auth
analyticsRoutes.use(isAuthAdmin);

// Dashboard overview
analyticsRoutes.get("/dashboard", getDashboardStats);

// Sales analytics
analyticsRoutes.get("/sales", getSalesAnalytics);

// Payment analytics
analyticsRoutes.get("/payments", getPaymentAnalytics);

// Customer analytics
analyticsRoutes.get("/customers", getCustomerAnalytics);

// Inventory analytics
analyticsRoutes.get("/inventory", getInventoryAnalytics);

// Order status distribution
analyticsRoutes.get("/orders/status", getOrderStatusDistribution);

// Coupon analytics
analyticsRoutes.get("/coupons", getCouponAnalytics);

// Seller analytics
analyticsRoutes.get("/seller", getSellerAnalytics);

export default analyticsRoutes;
