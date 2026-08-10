import express from "express";
import wishlistRoutes from "../wishlist/wishlist.routes.js";

const router = express.Router();
router.use(wishlistRoutes);

export default router;
