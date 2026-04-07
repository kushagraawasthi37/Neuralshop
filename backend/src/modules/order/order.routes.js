import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { validationErrorHandler } from "../../middlewares/validation.middleware.js";
import { orderValidations } from "../../utils/validations.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} from "./order.controller.js";
import checkIdempotency from "../../utils/idempotency-util.js";

const orderRoutes = express.Router();

// Apply idempotency check to order creation
orderRoutes.post(
  "/orders",
  isAuth,
  orderValidations.placeOrder,
  validationErrorHandler,
  checkIdempotency,
  createOrder,
);

orderRoutes.get("/orders", isAuth, getOrders);
orderRoutes.get("/orders/:orderId", isAuth, getOrderById);
orderRoutes.patch("/orders/:orderId/cancel", isAuth, cancelOrder);

export default orderRoutes;
