import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  initGuestCart,
  getGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  clearGuestCartEndpoint,
  deleteGuestCartEndpoint,
  migrateGuestCart,
} from "./guest-cart.controller.js";

const guestCartRoutes = express.Router();

// Initialize guest cart
guestCartRoutes.post("/init", initGuestCart);

// Get guest cart
guestCartRoutes.get("/", getGuestCart);

// Add item to guest cart
guestCartRoutes.post("/items", addToGuestCart);

// Remove item from guest cart
guestCartRoutes.delete("/items", removeFromGuestCart);

// Clear guest cart
guestCartRoutes.delete("/clear", clearGuestCartEndpoint);

// Delete guest cart
guestCartRoutes.delete("/", deleteGuestCartEndpoint);

// Migrate guest cart to user cart (after login)
guestCartRoutes.post("/migrate", isAuth, migrateGuestCart);

export default guestCartRoutes;
