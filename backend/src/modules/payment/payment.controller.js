import ApiResponse from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ApiError } from "../../utils/api-error.js";
import {
  initiatePaymentService,
  handleWebhookService,
  getPaymentService,
} from "./payment.service.js";

/* Checked
 * POST /orders/:orderId/pay - Initiate payment
 * Idempotency protected via header
 */
export const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const idempotencyKey = req.headers["idempotency-key"];

  const result = await initiatePaymentService(
    req.userId,
    orderId,
    idempotencyKey,
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, "Payment initiated successfully"));
});

/*
 * POST /webhook - Handle Razorpay webhook
 * ♻️ Idempotency protected via header
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const idempotencyKey = req.headers["idempotency-key"];

  if (!signature) {
    throw new ApiError(400, "Missing Razorpay signature", [], "payment");
  }

  const result = await handleWebhookService(req.body, idempotencyKey);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Webhook processed successfully"));
});

/**
 * GET /payments/:orderId - Get payment details
 */
export const getPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const payment = await getPaymentService(req.userId, orderId);

  res
    .status(200)
    .json(
      new ApiResponse(200, payment, "Payment details retrieved successfully"),
    );
});
