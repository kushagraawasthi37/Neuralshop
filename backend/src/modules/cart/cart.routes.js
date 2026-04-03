import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  validateCart,
  checkout,
  syncCart,
  mergeCart,
  summary,
} from "./cart.controller.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { cartValidations } from "../../utils/validations.js";

const cartRoutes = express.Router();

//Checked
cartRoutes.get("/", isAuth, getCart);

//Checked
cartRoutes.get("/summary", isAuth, summary);

//Checked
cartRoutes.post(
  "/items",
  isAuth,
  cartValidations.addItem,
  validationErrorHandler,
  addItem,
);

//Checked
cartRoutes.patch(
  "/items",
  isAuth,
  cartValidations.updateItem,
  validationErrorHandler,
  updateItem,
);

//Checked
cartRoutes.delete(
  "/items",
  isAuth,
  cartValidations.removeItem,
  validationErrorHandler,
  removeItem,
);

// Checked
cartRoutes.delete("/clear-cart", isAuth, clearCart);
//Checked
cartRoutes.post("/validate", isAuth, validateCart);
//Checked
cartRoutes.post("/checkout", isAuth, checkout);
//Checked
cartRoutes.post("/sync", isAuth, syncCart);

//Future use when we want to merge guest cart with user cart after login/signup
cartRoutes.post("/merge", isAuth, mergeCart);

export default cartRoutes;

//Cart Service Done
