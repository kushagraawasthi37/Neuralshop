import express from "express";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import {
  requestReturn,
  getUserReturns,
  getReturnRequest,
  cancelReturn,
  getAllReturns,
  approveReturn,
  rejectReturn,
  processRefund,
  markRefundFailed,
  getReturnStats,
} from "./return.controller.js";

const returnRoutes = express.Router();

// ============================================
// ADMIN ROUTES (must come before dynamic :returnId routes)
// ============================================

// Get return statistics
returnRoutes.get("/admin/stats", isAuthAdmin, getReturnStats);

// Get all return requests (for admin dashboard)
returnRoutes.get("/admin/all", isAuthAdmin, getAllReturns);

// Approve return request
returnRoutes.patch("/admin/:returnId/approve", isAuthAdmin, approveReturn);

// Reject return request
returnRoutes.patch("/admin/:returnId/reject", isAuthAdmin, rejectReturn);

// Process refund
returnRoutes.patch("/admin/:returnId/refund", isAuthAdmin, processRefund);

// Mark refund as failed
returnRoutes.patch(
  "/admin/:returnId/refund-failed",
  isAuthAdmin,
  markRefundFailed,
);

// ============================================
// USER ROUTES
// ============================================

// Request return
returnRoutes.post("/request", isAuth, requestReturn);

// Get user's return requests
returnRoutes.get("/", isAuth, getUserReturns);

// Get specific return request
returnRoutes.get("/:returnId", isAuth, getReturnRequest);

// Cancel return request
returnRoutes.patch("/:returnId/cancel", isAuth, cancelReturn);

export default returnRoutes;
