import expess from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCurrentAdmin,
  getCurrentUser,
} from "../controllers/user.controllers.js";

let userRoutes = expess.Router();

userRoutes.post("/getcurrentuser", isAuth, getCurrentUser);
userRoutes.post("/getcurrentadmin", isAuth, getCurrentAdmin);

export default userRoutes;
