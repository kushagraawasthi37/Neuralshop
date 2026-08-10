import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
  clearWishlist,
} from "./wishlist.controller.js";
import { cacheMiddleware } from "../../middlewares/cache.middleware.js";

const wishlistRoutes = express.Router();

wishlistRoutes.get(
  "/",
  isAuth,
  cacheMiddleware((req) => `wishlist:${req.userId}`, 3600),
  getWishlist,
);

wishlistRoutes.post("/add", isAuth, addToWishlist);
wishlistRoutes.post("/remove", isAuth, removeFromWishlist);
wishlistRoutes.get("/check", isAuth, checkInWishlist);
wishlistRoutes.delete("/clear", isAuth, clearWishlist);

export default wishlistRoutes;
