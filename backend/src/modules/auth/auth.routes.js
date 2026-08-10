import express from "express";
import {
  registration,
  login,
  adminLogout,
  userLogout,
  googleLogin,
  adminLogin,
  adminRegistration,
  verifyEmail,
  verifyAdminEmail,
  requestPasswordReset,
  resetPassword,
  verifyResetOtp,
  resendOtp,
  refreshAccessToken,
} from "./auth.controller.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { authValidations } from "../../utils/validations.js";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import {
  authLimiter,
  otpLimiter,
} from "../../middlewares/rateLimiter.middleware.js";

const authRoutes = express.Router();

//Checked
authRoutes.post(
  "/registration",
  authLimiter,
  authValidations.registration,
  validationErrorHandler,
  registration,
);

//Checked
authRoutes.post(
  "/login",
  authLimiter,
  authValidations.login,
  validationErrorHandler,
  login,
);
authRoutes.get("/user/logout", isAuth, userLogout);
//Checked
authRoutes.post(
  "/verify-email",
  otpLimiter,
  authValidations.verifyEmail,
  validationErrorHandler,
  verifyEmail,
);

authRoutes.get("/admin/logout", isAuthAdmin, adminLogout);

authRoutes.post(
  "/adminregister",
  authLimiter,
  authValidations.registration,
  validationErrorHandler,
  adminRegistration,
);

authRoutes.post(
  "/adminlogin",
  authLimiter,
  authValidations.login,
  validationErrorHandler,
  adminLogin,
);

authRoutes.post(
  "/verify-admin-email",
  otpLimiter,
  authValidations.verifyEmail,
  validationErrorHandler,
  verifyAdminEmail,
);

authRoutes.post("/resend-otp", otpLimiter, resendOtp);

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

authRoutes.post("/verify-reset-otp", verifyResetOtp);

authRoutes.post(
  "/googlelogin",
  authValidations.googleLogin,
  validationErrorHandler,
  googleLogin,
);

// Silent token refresh — no auth middleware needed (refresh token IS the credential)
authRoutes.post("/refresh", refreshAccessToken);

export default authRoutes;
