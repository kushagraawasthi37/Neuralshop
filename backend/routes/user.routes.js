import expess from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
  getCurrentAdmin,
  getCurrentUser,
} from "../controllers/user.controllers.js";

let userRoutes = expess.Router();

userRoutes.post("/getcurrentuser", isAuth, getCurrentUser);
userRoutes.post("/getcurrentadmin", isAuth, isAdmin, getCurrentAdmin);

export default userRoutes;
