import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { addToCart, getUserCart, UpdateCart } from "./cart.controller.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { cartValidations } from "../../utils/validations.js";

const cartRoutes = express.Router();

cartRoutes.post("/get", isAuth, getUserCart);

cartRoutes.post(
  "/add",
  isAuth,
  cartValidations.addToCart,
  validationErrorHandler,
  addToCart,
);

cartRoutes.post(
  "/update",
  isAuth,
  cartValidations.updateCart,
  validationErrorHandler,
  UpdateCart,
);

export default cartRoutes;
