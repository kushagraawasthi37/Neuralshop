import express from "express";
import {
  addProduct,
  listProduct,
  removeProduct,
} from "../controllers/product.controller.js";
import upload from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

let productRoutes = express.Router();

productRoutes.post(
  "/addproduct",
  isAuth,
  isAdmin,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

productRoutes.get("/list", isAuth, isAdmin, listProduct);
productRoutes.post("/remove/:id", isAuth, isAdmin, removeProduct);

export default productRoutes;
