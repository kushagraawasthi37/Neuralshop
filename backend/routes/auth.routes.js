import express from "express";
import { registeration } from "../controllers/auth.controllers.js";

const authRoutes = express.Router();

authRoutes.post("/registeration", registeration);

export default authRoutes;
