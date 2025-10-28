import uploadOnCloudinary from "../config/cloudinary.js";
import Admin from "../model/admin.model.js";
import Product from "../model/product.model.js";
import userRoutes from "../routes/user.routes.js";

export const addProduct = async (req, res) => {
  try {
    let { name, description, price, category, subCategory, sizes, bestseller } =
      req.body;

    const email = req.email;
    // Check if files exist
    if (
      !req.files?.image1?.[0] ||
      !req.files?.image2?.[0] ||
      !req.files?.image3?.[0] ||
      !req.files?.image4?.[0]
    ) {
      return res.status(400).json({ message: "All 4 images are required" });
    }

    console.log("Starting image uploads...");

    const image1 = await uploadOnCloudinary(req.files.image1[0].path);
    const image2 = await uploadOnCloudinary(req.files.image2[0].path);
    const image3 = await uploadOnCloudinary(req.files.image3[0].path);
    const image4 = await uploadOnCloudinary(req.files.image4[0].path);

    // Check if all uploads were successful
    if (!image1 || !image2 || !image3 || !image4) {
      return res.status(500).json({
        message: "Failed to upload images to Cloudinary",
        details: {
          image1: image1 ? "✓" : "✗",
          image2: image2 ? "✓" : "✗",
          image3: image3 ? "✓" : "✗",
          image4: image4 ? "✓" : "✗",
        },
      });
    }

    const owner = await Admin.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log("All images uploaded successfully");

    let productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true" ? true : false,
      image1,
      image2,
      image3,
      image4,
      date: Date.now(),
      owner: owner._id,
    };

    const token = req.token;
    const product = await Product.create(productData);
    console.log("product added");
    return res.status(201).json({ message: "Product created", product, token });
  } catch (error) {
    console.error("AddProduct error:", error);
    return res.status(500).json({
      message: "AddProduct error",
      error: error.message,
    });
  }
};

export const AdminlistProduct = async (req, res) => {
  try {
    const email = req.email;
    console.log("Admin Product list hitted");
    const owner = await Admin.findOne({ email });

    const token = req.token;
    const product = await Product.find({ owner: owner._id });
    return res.status(200).json({ product, token });
  } catch (error) {
    console.log("ListProduct error admin", error);
    return res
      .status(500)
      .json({ message: `ListProduct error admin ${error}` });
  }
};

export const listProduct = async (req, res) => {
  try {
    const token = req.token;
    const product = await Product.find();
    return res.status(200).json({ product, token });
  } catch (error) {
    console.log("ListProduct error", error);
    return res.status(500).json({ message: `ListProduct error ${error}` });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const token = req.token;
    // 1. Get admin ID from email
    const admin = await Admin.findOne({ email: req.email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Find product by id
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Check owner
    if (product.owner.toString() !== admin._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this product" });
    }

    // 4. Delete product
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
