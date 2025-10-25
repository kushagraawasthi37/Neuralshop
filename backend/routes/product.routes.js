import express from "express";
import {
  addProduct,
  listProduct,
  removeProduct,
} from "../controllers/product.controller.js";
import upload from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";

let productRoutes = express.Router();

productRoutes.post(
  "/addproduct",
  isAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

productRoutes.get("/list", isAuth, listProduct);
productRoutes.post("/remove/:id", isAuth, removeProduct);

export default productRoutes;
