import express from "express";

import isAuth from "../middlewares/isAuth.js";
import { addToCart, getUserCart, UpdateCart } from "../controllers/cart.controllers.js";
const cartRoutes = express.Router();

cartRoutes.post("/get", isAuth, getUserCart);
cartRoutes.post("/add", isAuth, addToCart);
cartRoutes.post("/update", isAuth, UpdateCart);

export default cartRoutes;
