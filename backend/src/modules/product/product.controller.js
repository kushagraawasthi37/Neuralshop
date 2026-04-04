import {
  addProductService,
  listProductService,
  listAdminProductsService,
  removeProductService,
  getProductByIdService,
  updateProductService,
  updateStockService,
} from "./product.service.js";


//Checked
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      bestseller,
      sizes,
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

//Checked
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

//Checked
export const listProduct = async (req, res) => {
  try {
    const queryParams = req.query;
    const result = await listProductService(queryParams);
    const token = req.token || "";
    return res.status(200).json({ ...result, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong try again later" });
  }
};

//Checked
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

//Checked
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const token = req.token || "";
    return res.status(200).json({ product, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Something went wrong" });
  }
};


//Checked
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
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

    const updatedProduct = await updateProductService(
      id,
      { name, description, price, category, subCategory, sizes, bestseller },
      email,
      req.files,
    );

    const token = req.token;
    return res
      .status(200)
      .json({ message: "Product updated", product: updatedProduct, token });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Product update failed",
    });
  }
};


//Checked
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, stockChange } = req.body;
    const email = req.email;

    const updatedProduct = await updateStockService(
      id,
      size,
      parseInt(stockChange),
      email,
    );

    const token = req.token;
    return res
      .status(200)
      .json({ message: "Stock updated", product: updatedProduct, token });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Stock update failed",
    });
  }
};
