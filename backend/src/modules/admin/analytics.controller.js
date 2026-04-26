import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  getDashboardStatsService,
  getSalesAnalyticsService,
  getPaymentAnalyticsService,
  getCustomerAnalyticsService,
  getInventoryAnalyticsService,
  getOrderStatusDistributionService,
  getCouponAnalyticsService,
  getSellerAnalyticsService,
} from "./analytics.service.js";

// Dashboard overview
export const getDashboardStats = asyncHandler(async (req, res) => {
  // For sellers: pass their ID, for admins: pass null
  const sellerId = req.adminId || null;

  const stats = await getDashboardStatsService(sellerId);

  res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Dashboard stats retrieved successfully"),
    );
});

// Sales analytics
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      "Start date and end date are required",
      [],
      "analytics",
    );
  }

  const sellerId = req.adminId || null;

  const analytics = await getSalesAnalyticsService(
    startDate,
    endDate,
    sellerId,
  );

  res
    .status(200)
    .json(new ApiResponse(200, analytics, "Sales analytics retrieved"));
});

// Payment analytics
export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      "Start date and end date are required",
      [],
      "analytics",
    );
  }

  const analytics = await getPaymentAnalyticsService(startDate, endDate);

  res
    .status(200)
    .json(new ApiResponse(200, analytics, "Payment analytics retrieved"));
});

// Customer analytics
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      "Start date and end date are required",
      [],
      "analytics",
    );
  }

  const analytics = await getCustomerAnalyticsService(startDate, endDate);

  res
    .status(200)
    .json(new ApiResponse(200, analytics, "Customer analytics retrieved"));
});

// Inventory analytics
export const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const sellerId = req.adminId || null;

  const analytics = await getInventoryAnalyticsService(sellerId);

  res
    .status(200)
    .json(new ApiResponse(200, analytics, "Inventory analytics retrieved"));
});

// Order status distribution
export const getOrderStatusDistribution = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      "Start date and end date are required",
      [],
      "analytics",
    );
  }

  const sellerId = req.adminId || null;

  const distribution = await getOrderStatusDistributionService(
    startDate,
    endDate,
    sellerId,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, distribution, "Order status distribution retrieved"),
    );
});

// Coupon analytics
export const getCouponAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      "Start date and end date are required",
      [],
      "analytics",
    );
  }

  const analytics = await getCouponAnalyticsService(startDate, endDate);

  res
    .status(200)
    .json(new ApiResponse(200, analytics, "Coupon analytics retrieved"));
});

// Seller analytics
export const getSellerAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      "Start date and end date are required",
      [],
      "analytics",
    );
  }

  const analytics = await getSellerAnalyticsService(
    req.adminId,
    startDate,
    endDate,
  );

  res
    .status(200)
    .json(new ApiResponse(200, analytics, "Seller analytics retrieved"));
});
