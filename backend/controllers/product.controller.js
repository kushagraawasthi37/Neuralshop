import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/product.model.js";

export const addProduct = async (req, res) => {
  try {
    let { name, description, price, category, subCategory, sizes, bestseller } =
      req.body;

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
    };

    const product = await Product.create(productData);

    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("AddProduct error:", error);
    return res.status(500).json({
      message: "AddProduct error",
      error: error.message,
    });
  }
};

export const listProduct = async (req, res) => {
  try {
    const product = await Product.find({});
    return res.status(200).json(product);
  } catch (error) {
    console.log("ListProduct error");
    return res.status(500).json({ message: `ListProduct error ${error}` });
  }
};

export const removeProduct = async (req, res) => {
  try {
    let { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    return res.status(200).json(product);
  } catch (error) {
    console.log("RemoveProduct error");
    return res.status(500).json({ message: `RemoveProduct error ${error}` });
  }
};
