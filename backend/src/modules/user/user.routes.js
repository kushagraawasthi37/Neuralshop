import express from "express";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import { validationErrorHandler } from "../../middlewares/validation.middleware.js";
import { userValidations } from "../../utils/validations.js";
import { getCurrentUser } from "./user.controller.js";
import { getCurrentAdmin } from "../auth/auth.controller.js";
import {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserDefaultAddress,
} from "./user.controller.js";

const userRoutes = express.Router();

// Legacy routes (keeping for compatibility)
userRoutes.post("/getcurrentuser", isAuth, getCurrentUser);
userRoutes.post("/getcurrentadmin", isAuthAdmin, getCurrentAdmin);

// ============================================
// USER PROFILE ROUTES
// ============================================

userRoutes.get("/profile", isAuth, getUserProfile);

userRoutes.patch(
  "/profile",
  isAuth,
  userValidations.updateProfile,
  validationErrorHandler,
  updateUserProfile,
);

// ============================================
// ADDRESS MANAGEMENT ROUTES
// ============================================

userRoutes.get("/addresses", isAuth, getUserAddresses);
userRoutes.post(
  "/addresses",
  isAuth,
  userValidations.createAddress,
  validationErrorHandler,
  createUserAddress,
);

userRoutes.patch(
  "/addresses/:addressId",
  isAuth,
  userValidations.updateAddress,
  validationErrorHandler,
  updateUserAddress,
);


userRoutes.delete(
  "/addresses/:addressId",
  isAuth,
  userValidations.deleteAddress,
  validationErrorHandler,
  deleteUserAddress,
);
userRoutes.get("/addresses/default", isAuth, getUserDefaultAddress);

export default userRoutes;
