import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  initiatePayment,
  handleWebhook,
  getPayment,
} from "./payment.controller.js";
import checkIdempotency from "../../utils/idempotency-util.js";

const paymentRoutes = express.Router();

// User routes
paymentRoutes.post(
  "/orders/:orderId/pay",
  isAuth,
  checkIdempotency,
  initiatePayment,
);


paymentRoutes.get("/payments/:orderId", isAuth, getPayment);

// Webhook route (no auth required, verified via signature)
paymentRoutes.post("/webhook", checkIdempotency, handleWebhook);

export default paymentRoutes;
