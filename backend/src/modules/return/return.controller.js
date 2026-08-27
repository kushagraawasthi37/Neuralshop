import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  requestReturnService,
  getUserReturnsService,
  getReturnRequestService,
  cancelReturnService,
  getAllReturnRequestsService,
  approveReturnService,
  rejectReturnService,
  processRefundService,
  markRefundFailedService,
  getReturnStatsService,
} from "./return.service.js";

// ============================================
// USER ENDPOINTS
// ============================================

// Request return
export const requestReturn = asyncHandler(async (req, res) => {
  const targetItemId = req.body.orderItemId || req.body.orderId;
  const { reason, description } = req.body;

  if (!targetItemId || !reason) {
    throw new ApiError(
      400,
      "Order item ID and reason are required",
      [],
      "return",
    );
  }

  const returnRequest = await requestReturnService(targetItemId, req.userId, {
    reason,
    description,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        returnRequest,
        "Return request created successfully",
      ),
    );
});

// Get user's return requests
export const getUserReturns = asyncHandler(async (req, res) => {
  const returns = await getUserReturnsService(req.userId);

  res
    .status(200)
    .json(
      new ApiResponse(200, returns, "Return requests retrieved successfully"),
    );
});

// Get specific return request
export const getReturnRequest = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await getReturnRequestService(returnId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, returnRequest, "Return request retrieved"));
});

// Cancel return request
export const cancelReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await cancelReturnService(returnId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, returnRequest, "Return request cancelled"));
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all return requests
export const getAllReturns = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 20, status } = req.query;

  const result = await getAllReturnRequestsService({
    adminId: req.userId,
    skip: parseInt(skip),
    limit: parseInt(limit),
    status,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Return requests retrieved successfully"),
    );
});

// Approve return request — refundAmount is optional, defaults to item price
export const approveReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const refundAmount = req.body.refundAmount;

  const returnRequest = await approveReturnService(
    returnId,
    req.userId,
    refundAmount,
  );

  res
    .status(200)
    .json(new ApiResponse(200, returnRequest, "Return request approved"));
});

// Reject return request
export const rejectReturn = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await rejectReturnService(returnId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, returnRequest, "Return request rejected"));
});

// Process refund
export const processRefund = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await processRefundService(returnId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, returnRequest, "Refund processed successfully"));
});

// Mark refund as failed
export const markRefundFailed = asyncHandler(async (req, res) => {
  const { returnId } = req.params;

  const returnRequest = await markRefundFailedService(returnId, req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, returnRequest, "Refund marked as failed"));
});

// Get return statistics
export const getReturnStats = asyncHandler(async (req, res) => {
  const stats = await getReturnStatsService(req.userId);

  res
    .status(200)
    .json(new ApiResponse(200, stats, "Return statistics retrieved"));
});
