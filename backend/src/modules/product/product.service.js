import Product from "./product.model.js";
import Admin from "../auth/auth.model.js";
import uploadOnCloudinary from "../../config/cloudinary.js";

export const addProductService = async (productData, adminEmail, files) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = productData;

    if (
      !files?.image1?.[0] ||
      !files?.image2?.[0] ||
      !files?.image3?.[0] ||
      !files?.image4?.[0]
    ) {
      throw new Error("All 4 images are required");
    }

    const image1 = await uploadOnCloudinary(files.image1[0].path);
    const image2 = await uploadOnCloudinary(files.image2[0].path);
    const image3 = await uploadOnCloudinary(files.image3[0].path);
    const image4 = await uploadOnCloudinary(files.image4[0].path);

    if (!image1 || !image2 || !image3 || !image4) {
      throw new Error("Failed to upload images to Cloudinary");
    }

    const owner = await Admin.findOne({ email: adminEmail });
    if (!owner) {
      throw new Error("Admin not found");
    }

    const product = await Product.create({
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
    });

    return product;
  } catch (error) {
    throw error;
  }
};

export const listProductService = async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    throw error;
  }
};

export const listAdminProductsService = async (adminEmail) => {
  try {
    const owner = await Admin.findOne({ email: adminEmail });
    const products = await Product.find({ owner: owner._id });
    return products;
  } catch (error) {
    throw error;
  }
};

export const removeProductService = async (productId, adminEmail) => {
  try {
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      throw new Error("Unauthorized Access");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (product.owner.toString() !== admin._id.toString()) {
      throw new Error("You are not authorized to delete this product");
    }

    await product.deleteOne();
    return { message: "Product deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findById(productId);
    return product;
  } catch (error) {
    throw error;
  }
};
