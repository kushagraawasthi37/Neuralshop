import express from "express";
import reviewRoutes from "../review/review.routes.js";

const router = express.Router();
router.use(reviewRoutes);

export default router;
