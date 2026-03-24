import express from "express";
import {
  addProduct,
  AdminlistProduct,
  listProduct,
  removeProduct,
} from "./product.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import isAuth from "../../middlewares/auth.middleware.js";
import isAdmin from "../../middlewares/admin.middleware.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { productValidations } from "../../utils/validations.js";

const productRoutes = express.Router();

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
  productValidations.addProduct,
  validationErrorHandler,
  addProduct,
);

productRoutes.get("/admin/list", isAuth, isAdmin, AdminlistProduct);

productRoutes.get(
  "/list",
  productValidations.listProduct,
  validationErrorHandler,
  listProduct,
);

productRoutes.post(
  "/remove/:id",
  isAuth,
  isAdmin,
  productValidations.removeProduct,
  validationErrorHandler,
  removeProduct,
);

export default productRoutes;
