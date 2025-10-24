import express from "express";
import {
  login,
  logout,
  registeration,
} from "../controllers/auth.controllers.js";

const authRoutes = express.Router();

authRoutes.post("/registeration", registeration);
authRoutes.post("/login", login);
authRoutes.get("/logout", logout);

export default authRoutes;
