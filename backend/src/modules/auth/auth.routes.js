import express from "express";
import {
  registration,
  login,
  logOut,
  googleLogin,
  adminLogin,
  adminRegistration,
} from "./auth.controller.js";
import isAuth from "../../middlewares/auth.middleware.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { authValidations } from "../../utils/validations.js";

const authRoutes = express.Router();

authRoutes.post(
  "/registration",
  authValidations.registration,
  validationErrorHandler,
  registration,
);

authRoutes.post("/login", authValidations.login, validationErrorHandler, login);

authRoutes.get("/logout", logOut);

authRoutes.post(
  "/googlelogin",
  authValidations.googleLogin,
  validationErrorHandler,
  googleLogin,
);

authRoutes.post(
  "/adminregister",
  authValidations.registration,
  validationErrorHandler,
  adminRegistration,
);

authRoutes.post(
  "/adminlogin",
  authValidations.login,
  validationErrorHandler,
  adminLogin,
);

export default authRoutes;
