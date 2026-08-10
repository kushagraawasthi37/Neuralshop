import express from "express";
import recommendationRoutes from "../recommendation/recommendation.routes.js";

const router = express.Router();
router.use(recommendationRoutes);

export default router;
