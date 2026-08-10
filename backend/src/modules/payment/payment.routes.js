import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { initiatePayment, handleWebhook, getPayment } from "./payment.controller.js";
import checkIdempotency from "../../utils/idempotency-util.js";
import verifyRazorpaySignature from "../../middlewares/webhookVerification.middleware.js";
import { paymentLimiter } from "../../middlewares/rateLimiter.middleware.js";

const paymentRoutes = express.Router();

// Payment initiation — rate limited to 10/min to prevent parallel payment attempts
paymentRoutes.post(
  "/orders/:orderId/pay",
  paymentLimiter,
  isAuth,
  checkIdempotency,
  initiatePayment,
);

paymentRoutes.get("/payments/:orderId", isAuth, getPayment);

// Webhook — signature verification replaces auth (Razorpay sends from their servers)
// Note: express.raw() body parser is applied to /webhook in app.js BEFORE express.json()
paymentRoutes.post("/webhook", verifyRazorpaySignature, handleWebhook);

export default paymentRoutes;
