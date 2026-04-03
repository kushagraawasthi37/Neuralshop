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
  getCurrentUser,
} from "./auth.controller.js";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { authValidations } from "../../utils/validations.js";

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

//Checked
authRoutes.get("/logout", logOut);

//Checked
authRoutes.post(
  "/adminregister",
  authValidations.registration,
  validationErrorHandler,
  adminRegistration,
);

//Checked
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

//checked
authRoutes.post(
  "/verify-admin-email",
  authValidations.verifyEmail,
  validationErrorHandler,
  verifyAdminEmail,
);

//Checked
authRoutes.post("/resend-otp", resendOtp);

//Checked
authRoutes.post(
  "/request-password-reset",
  authValidations.requestPasswordReset,
  validationErrorHandler,
  requestPasswordReset,
);

//Checked
authRoutes.post(
  "/reset-password",
  authValidations.resetPassword,
  validationErrorHandler,
  resetPassword,
);

//Checked
authRoutes.get("/get-current-user", isAuth, getCurrentUser);


//Checked
authRoutes.get("/get-current-admin", isAuthAdmin, getCurrentAdmin);

//Not Checked
authRoutes.post(
  "/googlelogin",
  authValidations.googleLogin,
  validationErrorHandler,
  googleLogin,
);

export default authRoutes;
