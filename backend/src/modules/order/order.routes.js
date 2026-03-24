import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  placeOrder,
  placeOrderRazorpay,
  userOrders,
  verifyRazorpay,
  allOrders,
  updateStatus,
} from "./order.controller.js";
import isAdmin from "../../middlewares/admin.middleware.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { orderValidations } from "../../utils/validations.js";

const orderRoutes = express.Router();

// for User
orderRoutes.post(
  "/placeorder",
  isAuth,
  orderValidations.placeOrder,
  validationErrorHandler,
  placeOrder,
);

orderRoutes.post(
  "/razorpay",
  isAuth,
  orderValidations.placeOrder,
  validationErrorHandler,
  placeOrderRazorpay,
);

orderRoutes.post("/userorder", isAuth, userOrders);

orderRoutes.post("/verifyrazorpay", isAuth, verifyRazorpay);

// for Admin
orderRoutes.post("/list", isAuth, isAdmin, allOrders);

orderRoutes.post(
  "/status",
  isAuth,
  isAdmin,
  orderValidations.updateStatus,
  validationErrorHandler,
  updateStatus,
);

export default orderRoutes;
