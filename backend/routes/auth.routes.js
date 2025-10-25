import express from "express";
import {
  adminLogin,
  adminRegistration,
  googleLogin,
  login,
  logOut,
  registration,
} from "../controllers/auth.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const authRoutes = express.Router();

authRoutes.post("/registeration", registration);
authRoutes.post("/login", login);
authRoutes.get("/logout", isAuth, logOut);
authRoutes.post("/googlelogin", googleLogin);
authRoutes.post("/adminlogin", adminLogin);
authRoutes.post("/adminregister", adminRegistration);

export default authRoutes;
