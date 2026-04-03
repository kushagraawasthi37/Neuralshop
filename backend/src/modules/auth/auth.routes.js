import express from "express";
import {
  registration,
  login,
  logOut,
  googleLogin,
  adminLogin,
  adminRegistration,
  verifyEmail,
  verifyAdminEmail,
  requestPasswordReset,
  resetPassword,
  resendOtp,
  getCurrentAdmin,
} from "./auth.controller.js";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
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

authRoutes.post(
  "/verify-email",
  authValidations.verifyEmail,
  validationErrorHandler,
  verifyEmail,
);

authRoutes.post(
  "/verify-admin-email",
  authValidations.verifyEmail,
  validationErrorHandler,
  verifyAdminEmail,
);

authRoutes.post("/resend-otp", resendOtp);

authRoutes.post(
  "/request-password-reset",
  authValidations.requestPasswordReset,
  validationErrorHandler,
  requestPasswordReset,
);

authRoutes.post(
  "/reset-password",
  authValidations.resetPassword,
  validationErrorHandler,
  resetPassword,
);

authRoutes.get("/get-current-admin", isAuthAdmin, getCurrentAdmin);

authRoutes.post(
  "/googlelogin",
  authValidations.googleLogin,
  validationErrorHandler,
  googleLogin,
);

export default authRoutes;
