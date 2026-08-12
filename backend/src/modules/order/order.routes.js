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
  "/",
  isAuth,
  orderValidations.placeOrder,
  validationErrorHandler,
  checkIdempotency,
  createOrder,
);

orderRoutes.get("/my-orders", isAuth, getOrders);
orderRoutes.get("/:orderId", isAuth, getOrderById);
orderRoutes.patch("/:orderId/cancel", isAuth, cancelOrder);

export default orderRoutes;
