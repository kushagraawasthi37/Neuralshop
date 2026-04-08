import { Product } from "./product.model.js";
import Admin from "../auth/auth.model.js";
import { ApiError } from "../../utils/api-error.js";
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
  const { name, description, price, category, subCategory, sizes, bestseller } =
    productData;

  if (
    !files?.image1?.[0] ||
    !files?.image2?.[0] ||
    !files?.image3?.[0] ||
    !files?.image4?.[0]
  ) {
    throw new ApiError(400, "All 4 images are required", [], "product");
  }

  const image1 = await uploadOnCloudinary(files.image1[0].path);
  const image2 = await uploadOnCloudinary(files.image2[0].path);
  const image3 = await uploadOnCloudinary(files.image3[0].path);
  const image4 = await uploadOnCloudinary(files.image4[0].path);

  if (!image1 || !image2 || !image3 || !image4) {
    throw new ApiError(
      500,
      "Failed to upload images to Cloudinary",
      [],
      "product",
    );
  }

  const owner = await Admin.findOne({ email: adminEmail });
  if (!owner) {
    throw new ApiError(404, "Admin not found", [], "product");
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

  try {
    for (const sizeEntry of parsedSizes) {
      await initializeInventoryService(
        product._id.toString(),
        sizeEntry.size,
        Number(sizeEntry.stock) || 0,
      );
    }
  } catch (inventoryError) {
    await product.deleteOne().catch(() => {});
    throw inventoryError;
  }

  indexProduct(product).catch(() => {});

  return product;
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
    if (!owner) {
      throw new ApiError(404, "Admin not found", [], "product");
    }
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
      throw new ApiError(401, "Unauthorized", [], "product");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found", [], "product");
    }

    if (product.owner.toString() !== admin._id.toString()) {
      throw new ApiError(403, "Forbidden", [], "product");
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
  const admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    throw new ApiError(401, "Unauthorized", [], "product");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found", [], "product");
  }

  if (product.owner.toString() !== admin._id.toString()) {
    throw new ApiError(403, "Forbidden", [], "product");
  }

  const { name, description, price, category, subCategory, sizes, bestseller } =
    updateData;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (description) updateFields.description = description;
  if (price) updateFields.price = Number(price);
  if (category) updateFields.category = category;
  if (subCategory) updateFields.subCategory = subCategory;
  const originalSizes = product.sizes;
  let newSizes = null;

  if (sizes) {
    const parsedSizes = parseSizes(sizes);
    updateFields.sizes = parsedSizes;
    newSizes = parsedSizes;
  }
  if (bestseller !== undefined) updateFields.bestseller = bestseller === "true";

  if (files) {
    updateFields.images = [...product.images];
    if (files.image1?.[0]) {
      const image1 = await uploadOnCloudinary(files.image1[0].path);
      if (image1) updateFields.images[0] = image1;
    }
    if (files.image2?.[0]) {
      const image2 = await uploadOnCloudinary(files.image2[0].path);
      if (image2) updateFields.images[1] = image2;
    }
    if (files.image3?.[0]) {
      const image3 = await uploadOnCloudinary(files.image3[0].path);
      if (image3) updateFields.images[2] = image3;
    }
    if (files.image4?.[0]) {
      const image4 = await uploadOnCloudinary(files.image4[0].path);
      if (image4) updateFields.images[3] = image4;
    }
  }

  const originalProduct = product.toObject();

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    updateFields,
    { new: true },
  );

  if (newSizes !== null) {
    try {
      for (const sizeEntry of newSizes) {
        await updateTotalStockService(
          productId,
          sizeEntry.size,
          Number(sizeEntry.stock) || 0,
        );
      }
    } catch (inventoryError) {
      await Product.findByIdAndUpdate(productId, originalProduct).catch(
        () => {},
      );
      throw inventoryError;
    }
  }

  updateProductIndex(productId, updateFields).catch(() => {});

  return updatedProduct;
};

//Checked
export const updateStockService = async (
  productId,
  size,
  stockChange,
  adminEmail,
) => {
  const admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    throw new ApiError(401, "Unauthorized", [], "product");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found", [], "product");
  }

  if (product.owner.toString() !== admin._id.toString()) {
    throw new ApiError(403, "Forbidden", [], "product");
  }

  const sizeIndex = product.sizes.findIndex((s) => s.size === size);
  if (sizeIndex === -1) {
    throw new ApiError(400, "Size not found", [], "product");
  }

  const originalProduct = product.toObject();

  product.sizes[sizeIndex].stock += stockChange;
  if (product.sizes[sizeIndex].stock < 0) {
    product.sizes[sizeIndex].stock = 0;
  }

  const newStock = product.sizes[sizeIndex].stock;

  await product.save();

  try {
    await updateTotalStockService(productId, size, newStock);
  } catch (inventoryError) {
    await Product.findByIdAndUpdate(productId, originalProduct).catch(() => {});
    throw inventoryError;
  }

  updateProductIndex(productId, { sizes: product.sizes }).catch(() => {});

  return product;
};
