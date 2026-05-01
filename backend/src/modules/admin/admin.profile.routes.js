import express from "express";
import bcrypt from "bcrypt";
import { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import Admin from "../auth/auth.model.js";

const adminProfileRoutes = express.Router();

adminProfileRoutes.use(isAuthAdmin);

// GET /api/admin/profile
adminProfileRoutes.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const admin = await Admin.findOne({ email: req.email }).select("-password");
    if (!admin) throw new ApiError(404, "Admin not found");
    return res.status(200).json(new ApiResponse(200, admin, "Profile fetched"));
  }),
);

// PATCH /api/admin/profile
adminProfileRoutes.patch(
  "/profile",
  asyncHandler(async (req, res) => {
    const { name, businessName } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (businessName !== undefined) update.businessName = businessName;

    const admin = await Admin.findOneAndUpdate(
      { email: req.email },
      { $set: update },
      { new: true, runValidators: true },
    ).select("-password");

    if (!admin) throw new ApiError(404, "Admin not found");
    return res.status(200).json(new ApiResponse(200, admin, "Profile updated"));
  }),
);

// PATCH /api/admin/change-password
adminProfileRoutes.patch(
  "/change-password",
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "currentPassword and newPassword are required");
    }
    if (newPassword.length < 8) {
      throw new ApiError(400, "New password must be at least 8 characters");
    }

    const admin = await Admin.findOne({ email: req.email }).select("+password");
    if (!admin) throw new ApiError(404, "Admin not found");

    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) throw new ApiError(400, "Current password is incorrect");

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
  }),
);

export default adminProfileRoutes;
