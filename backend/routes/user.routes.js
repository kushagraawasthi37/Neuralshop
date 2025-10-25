import expess from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser } from "../controllers/user.controllers.js";

let userRoutes = expess.Router();

userRoutes.post("/getcurrentuser", isAuth, getCurrentUser);

export default userRoutes;
