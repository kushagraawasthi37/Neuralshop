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
import { cacheMiddleware } from "../../middlewares/cache.middleware.js";
import { stableHash } from "../../utils/cache.js";

const analyticsRoutes = express.Router();

// All analytics endpoints require admin auth
analyticsRoutes.use(isAuthAdmin);

// Dashboard overview
analyticsRoutes.get(
  "/dashboard",
  cacheMiddleware(
    (req) => `analytics:dashboard:${req.adminId}:${stableHash(req.query)}`,
    3600,
  ),
  getDashboardStats,
);

// Sales analytics
analyticsRoutes.get(
  "/sales",
  cacheMiddleware(
    (req) => `analytics:sales:${req.adminId}:${stableHash(req.query)}`,
    3600,
  ),
  getSalesAnalytics,
);

// Payment analytics
analyticsRoutes.get(
  "/payments",
  cacheMiddleware(
    (req) => `analytics:payments:${req.adminId}:${stableHash(req.query)}`,
    7200,
  ),
  getPaymentAnalytics,
);

// Customer analytics
analyticsRoutes.get(
  "/customers",
  cacheMiddleware(
    (req) => `analytics:customers:${req.adminId}:${stableHash(req.query)}`,
    3600,
  ),
  getCustomerAnalytics,
);

// Inventory analytics
analyticsRoutes.get(
  "/inventory",
  cacheMiddleware(
    (req) => `analytics:inventory:${req.adminId}:${stableHash(req.query)}`,
    21600,
  ),
  getInventoryAnalytics,
);

// Order status distribution
analyticsRoutes.get(
  "/orders/status",
  cacheMiddleware(
    (req) => `analytics:orders_status:${req.adminId}:${stableHash(req.query)}`,
    1800,
  ),
  getOrderStatusDistribution,
);

// Coupon analytics
analyticsRoutes.get(
  "/coupons",
  cacheMiddleware(
    (req) => `analytics:coupons:${req.adminId}:${stableHash(req.query)}`,
    7200,
  ),
  getCouponAnalytics,
);

// Seller analytics
analyticsRoutes.get(
  "/seller",
  cacheMiddleware(
    (req) => `analytics:seller:${req.adminId}:${stableHash(req.query)}`,
    3600,
  ),
  getSellerAnalytics,
);

export default analyticsRoutes;
