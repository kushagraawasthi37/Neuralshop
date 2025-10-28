import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  allOrders,
  placeOrder,
  placeOrderRazorpay,
  updateStatus,
  userOrders,
  verifyRazorpay,
} from "../controllers/order.controllers.js";
import isAdmin from "../middlewares/isAdmin.js";

const orderRoutes = express.Router();

//for User
orderRoutes.post("/placeorder", isAuth, placeOrder);
orderRoutes.post("/razorpay", isAuth, placeOrderRazorpay);
orderRoutes.post("/userorder", isAuth, userOrders);
orderRoutes.post("/verifyrazorpay", isAuth, verifyRazorpay);

// //for Admin
orderRoutes.post("/list", isAuth, isAdmin, allOrders);
orderRoutes.post("/status", isAuth, isAdmin, updateStatus);

export default orderRoutes;
