import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
  clearWishlist,
} from "./wishlist.controller.js";

const wishlistRoutes = express.Router();

// Get wishlist
wishlistRoutes.get("/", isAuth, getWishlist);

// Add to wishlist
wishlistRoutes.post("/add", isAuth, addToWishlist);

// Remove from wishlist
wishlistRoutes.post("/remove", isAuth, removeFromWishlist);

// Check if in wishlist
wishlistRoutes.get("/check", isAuth, checkInWishlist);

// Clear wishlist
wishlistRoutes.delete("/clear", isAuth, clearWishlist);

export default wishlistRoutes;
