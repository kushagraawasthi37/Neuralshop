import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import isAdmin from "../../middlewares/admin.middleware.js";
import { getCurrentUser } from "./user.controller.js";
import { getCurrentAdmin } from "../auth/auth.controller.js";

const userRoutes = express.Router();

userRoutes.post("/getcurrentuser", isAuth, getCurrentUser);
userRoutes.post("/getcurrentadmin", isAuth, isAdmin, getCurrentAdmin);

export default userRoutes;
