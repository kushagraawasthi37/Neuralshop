import { Product } from "./product.model.js";
import Admin from "../auth/auth.model.js";
import uploadOnCloudinary from "../../config/cloudinary.js";
import {
  indexProduct,
  updateProductIndex,
  deleteProductIndex,
  searchProducts,
} from "./elasticsearch.service.js";
import {
  initializeInventoryService,
  updateTotalStockService,
} from "../inventory/inventory.service.js";

const parseSizes = (sizesInput) => {
  if (!sizesInput) return [];
  if (typeof sizesInput === "string") return JSON.parse(sizesInput);
  return sizesInput;
};

const calculateTotalStock = (sizes) =>
  sizes.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);

//Checked
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

    const parsedSizes = parseSizes(sizes);
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: parsedSizes,
      bestseller: bestseller === "true" ? true : false,
      images: [image1, image2, image3, image4],
      owner: owner._id,
    });

    const initialStock = calculateTotalStock(parsedSizes);
    try {
      await initializeInventoryService(product._id.toString(), initialStock);
    } catch (inventoryError) {
      await product.deleteOne();
      throw inventoryError;
    }

    // Index in Elasticsearch
    await indexProduct(product);

    return product;
  } catch (error) {
    throw error;
  }
};

//Checked
export const listProductService = async (queryParams) => {
  try {
    const {
      search,
      category,
      subCategory,
      priceMin,
      priceMax,
      ratingMin,
      bestseller,
      sort,
      page = 1,
      limit = 10,
    } = queryParams;

    const filters = {};
    if (category) filters.category = category;
    if (subCategory) filters.subCategory = subCategory;
    if (priceMin !== undefined) filters.priceMin = parseFloat(priceMin);
    if (priceMax !== undefined) filters.priceMax = parseFloat(priceMax);
    if (ratingMin !== undefined) filters.ratingMin = parseFloat(ratingMin);
    if (bestseller !== undefined) filters.bestseller = bestseller === "true";

    try {
      // Try Elasticsearch first
      const result = await searchProducts(
        search,
        filters,
        sort,
        parseInt(page),
        parseInt(limit),
      );
      return result;
    } catch (esError) {
      console.warn(
        "Elasticsearch search failed, falling back to MongoDB:",
        esError.message,
      );
      // Fallback to MongoDB
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }
      if (category) query.category = category;
      if (subCategory) query.subCategory = subCategory;
      if (priceMin !== undefined || priceMax !== undefined) {
        query.price = {};
        if (priceMin !== undefined) query.price.$gte = parseFloat(priceMin);
        if (priceMax !== undefined) query.price.$lte = parseFloat(priceMax);
      }
      if (ratingMin !== undefined)
        query.rating = { $gte: parseFloat(ratingMin) };
      if (bestseller !== undefined) query.bestseller = bestseller === "true";

      const sortOptions = {};
      if (sort === "price_asc") sortOptions.price = 1;
      else if (sort === "price_desc") sortOptions.price = -1;
      else if (sort === "newest") sortOptions.createdAt = -1;
      else if (sort === "rating") sortOptions.rating = -1;

      const products = await Product.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      return {
        products,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      };
    }
  } catch (error) {
    throw error;
  }
};

//Checked
export const listAdminProductsService = async (adminEmail) => {
  try {
    const owner = await Admin.findOne({ email: adminEmail });
    const products = await Product.find({ owner: owner._id });
    return products;
  } catch (error) {
    throw error;
  }
};

//Checked
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

    // Delete from Elasticsearch index
    await deleteProductIndex(productId);

    return { message: "Product deleted successfully" };
  } catch (error) {
    throw error;
  }
};

//Checked
export const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findById(productId);
    return product;
  } catch (error) {
    throw error;
  }
};

//Checked
export const updateProductService = async (
  productId,
  updateData,
  adminEmail,
  files,
) => {
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
      throw new Error("You are not authorized to update this product");
    }

    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = updateData;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (price) updateFields.price = Number(price);
    if (category) updateFields.category = category;
    if (subCategory) updateFields.subCategory = subCategory;
    const originalSizes = product.sizes;
    let newTotalStock = null;

    if (sizes) {
      const parsedSizes = parseSizes(sizes);
      updateFields.sizes = parsedSizes;
      newTotalStock = calculateTotalStock(parsedSizes);
    }
    if (bestseller !== undefined)
      updateFields.bestseller = bestseller === "true";

    if (files) {
      if (files.image1?.[0]) {
        const image1 = await uploadOnCloudinary(files.image1[0].path);
        if (image1) updateFields.images = updateFields.images || product.images;
        updateFields.images[0] = image1;
      }
      if (files.image2?.[0]) {
        const image2 = await uploadOnCloudinary(files.image2[0].path);
        if (image2) updateFields.images = updateFields.images || product.images;
        updateFields.images[1] = image2;
      }
      if (files.image3?.[0]) {
        const image3 = await uploadOnCloudinary(files.image3[0].path);
        if (image3) updateFields.images = updateFields.images || product.images;
        updateFields.images[2] = image3;
      }
      if (files.image4?.[0]) {
        const image4 = await uploadOnCloudinary(files.image4[0].path);
        if (image4) updateFields.images = updateFields.images || product.images;
        updateFields.images[3] = image4;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateFields,
      { new: true },
    );

    if (newTotalStock !== null) {
      try {
        await updateTotalStockService(productId, newTotalStock);
      } catch (inventoryError) {
        await Product.findByIdAndUpdate(productId, {
          sizes: originalSizes,
        });
        throw inventoryError;
      }
    }

    // Update Elasticsearch index
    await updateProductIndex(productId, updateFields);

    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

//Checked
export const updateStockService = async (
  productId,
  size,
  stockChange,
  adminEmail,
) => {
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
      throw new Error("You are not authorized to update this product");
    }

    const sizeIndex = product.sizes.findIndex((s) => s.size === size);
    if (sizeIndex === -1) {
      throw new Error("Size not found");
    }

    const originalSizes = [...product.sizes.map((s) => ({ ...s }))];

    product.sizes[sizeIndex].stock += stockChange;
    if (product.sizes[sizeIndex].stock < 0) {
      product.sizes[sizeIndex].stock = 0;
    }

    const newTotalStock = calculateTotalStock(product.sizes);

    await product.save();

    try {
      await updateTotalStockService(productId, newTotalStock);
    } catch (inventoryError) {
      await Product.findByIdAndUpdate(productId, { sizes: originalSizes });
      throw inventoryError;
    }

    // Update Elasticsearch index
    await updateProductIndex(productId, { sizes: product.sizes });

    return product;
  } catch (error) {
    throw error;
  }
};
