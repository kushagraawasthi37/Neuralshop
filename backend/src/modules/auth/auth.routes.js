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
  resendOtp,
} from "./auth.controller.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { authValidations } from "../../utils/validations.js";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";

const authRoutes = express.Router();

//Checked
authRoutes.post(
  "/registration",
  authValidations.registration,
  validationErrorHandler,
  registration,
);

//Checked
authRoutes.post("/login", authValidations.login, validationErrorHandler, login);

authRoutes.get("/user/logout", isAuth, userLogout);
authRoutes.get("/admin/logout", isAuthAdmin, adminLogout);

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


//Checked
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

authRoutes.post(
  "/googlelogin",
  authValidations.googleLogin,
  validationErrorHandler,
  googleLogin,
);

export default authRoutes;
