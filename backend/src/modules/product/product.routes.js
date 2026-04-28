import express from "express";
import {
  addProduct,
  AdminlistProduct,
  listProduct,
  removeProduct,
  getProductById,
  updateProduct,
  updateStock,
  browseProducts,
} from "./product.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import isAuth, { isAuthAdmin } from "../../middlewares/auth.middleware.js";
import validationErrorHandler from "../../middlewares/validation.middleware.js";
import { productValidations } from "../../utils/validations.js";

const productRoutes = express.Router();

//Checked
productRoutes.post(
  "/addproduct",
  isAuthAdmin,
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

//Checked
productRoutes.get("/admin/list", isAuthAdmin, AdminlistProduct);

//Checked
productRoutes.post(
  "/remove/:id",
  isAuthAdmin,
  productValidations.removeProduct,
  validationErrorHandler,
  removeProduct,
);

//Checked
productRoutes.put(
  "/update/:id",
  isAuthAdmin,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  productValidations.updateProduct,
  validationErrorHandler,
  updateProduct,
);

//Checked
productRoutes.put(
  "/update-stock/:id",
  isAuthAdmin,
  productValidations.updateStock,
  validationErrorHandler,
  updateStock,
);

//Optimized browse endpoint for home page pagination
productRoutes.get(
  "/browse/all",
  productValidations.browseProducts,
  validationErrorHandler,
  browseProducts,
);

//Checked
productRoutes.get(
  "/list",
  productValidations.listProduct,
  validationErrorHandler,
  listProduct,
);

//Checked
productRoutes.get(
  "/:id",
  productValidations.getProductById,
  validationErrorHandler,
  getProductById,
);

export default productRoutes;
