import {
  addProductService,
  listProductService,
  listAdminProductsService,
  removeProductService,
} from "./product.service.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;
    const email = req.email;

    const product = await addProductService(
      { name, description, price, category, subCategory, sizes, bestseller },
      email,
      req.files,
    );

    const token = req.token;
    return res.status(201).json({ message: "Product Added", product, token });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Product add failed",
    });
  }
};

export const AdminlistProduct = async (req, res) => {
  try {
    const email = req.email;
    const products = await listAdminProductsService(email);
    const token = req.token;
    return res.status(200).json({ product: products, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong try again later" });
  }
};

export const listProduct = async (req, res) => {
  try {
    const products = await listProductService();
    const token = req.token || "";
    return res.status(200).json({ product: products, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong try again later" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.email;
    const token = req.token;

    await removeProductService(id, email);
    res.status(200).json({ message: "Product deleted successfully", token });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};
