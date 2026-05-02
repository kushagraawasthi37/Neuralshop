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
import { deleteCache, deleteByPattern } from "../../utils/cache.js";

const parseSizes = (sizesInput) => {
  if (!sizesInput) return [];
  if (typeof sizesInput === "string") return JSON.parse(sizesInput);
  return sizesInput;
};

const calculateTotalStock = (sizes) =>
  sizes.reduce((sum, item) => sum + (Number(item.stock) || 0), 0);

//Checked
export const addProductService = async (productData, adminEmail, files) => {
  // console.log("Adding product with data:", productData);
  const { name, description, price, category, subCategory, sizes, bestseller } =
    productData;

  console.log("Received files:", files);

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

  await deleteByPattern("products:*");
  await deleteByPattern("search:*");
  await deleteCache("trending_products");
  await deleteCache("recommended_products");

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
      sortBy,
      order,
      page = 1,
      skip,
      limit = 10,
    } = queryParams;

    const limitNum = parseInt(limit);
    const skipNum = skip !== undefined ? parseInt(skip) : 0;
    const pageNum = queryParams.page
      ? parseInt(page)
      : Math.floor(skipNum / limitNum) + 1;

    const effectiveSort = sortBy && order ? `${sortBy}_${order}` : sort;

    const filters = {};
    if (category) filters.category = category;
    if (subCategory) filters.subCategory = subCategory;
    if (priceMin !== undefined) filters.priceMin = parseFloat(priceMin);
    if (priceMax !== undefined) filters.priceMax = parseFloat(priceMax);
    if (ratingMin !== undefined) filters.ratingMin = parseFloat(ratingMin);
    if (bestseller !== undefined) filters.bestseller = bestseller === "true";

    // Try Elasticsearch first — only use results if it actually finds products
    try {
      const result = await searchProducts(
        search,
        filters,
        effectiveSort,
        pageNum,
        limitNum,
      );

      if (result.total > 0) {
        // Enrich ALL ES results with full MongoDB data so prices/reviews/sizes are always fresh
        const productIds = result.products.map((p) => p._id);
        const dbProducts = await Product.find({ _id: { $in: productIds } })
          .select(
            "name price as offerPrice images category rating reviewCount bestseller sizes createdAt",
          )
          .lean();

        const productMap = Object.fromEntries(
          dbProducts.map((p) => [p._id.toString(), p]),
        );

        // Merge ES doc (for _id/score) with MongoDB fields (for fresh data)
        result.products = result.products.map((p) => {
          const db = productMap[p._id] || {};
          const { price, ...restDb } = db;
          return { ...p, ...restDb, offerPrice: price, _id: p._id };
        });

        return result;
      }
      // ES returned 0 — fall through to MongoDB (index may be empty or stale)
    } catch (esError) {
      console.warn(
        "Elasticsearch unavailable, falling back to MongoDB:",
        esError.message,
      );
    }

    // MongoDB fallback — always runs when ES returns nothing or errors
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subCategory: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Case-insensitive exact match for category/subCategory
    if (category) query.category = { $regex: `^${category}$`, $options: "i" };
    if (subCategory)
      query.subCategory = { $regex: `^${subCategory}$`, $options: "i" };

    if (priceMin !== undefined || priceMax !== undefined) {
      query.price = {};
      if (priceMin !== undefined) query.price.$gte = parseFloat(priceMin);
      if (priceMax !== undefined) query.price.$lte = parseFloat(priceMax);
    }

    if (ratingMin !== undefined) {
      query.rating = { $gte: parseFloat(ratingMin) };
    }

    if (bestseller !== undefined) {
      query.bestseller = bestseller === "true";
    }

    const sortOptions = {};
    switch (effectiveSort) {
      case "price_asc":
        sortOptions.price = 1;
        break;
      case "price_desc":
        sortOptions.price = -1;
        break;
      case "newest":
      case "createdAt_desc":
        sortOptions.createdAt = -1;
        break;
      case "createdAt_asc":
        sortOptions.createdAt = 1;
        break;
      case "rating":
      case "rating_desc":
        sortOptions.rating = -1;
        break;
      case "name_asc":
        sortOptions.name = 1;
        break;
      case "name_desc":
        sortOptions.name = -1;
        break;
      default:
        sortOptions.createdAt = -1;
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skipNum)
        .limit(limitNum)
        .select(
          "name price as offerPrice images category rating reviewCount bestseller sizes createdAt",
        )
        .lean(),
      Product.countDocuments(query),
    ]);

    return { products, total, page: pageNum, skip: skipNum, limit: limitNum };
  } catch (error) {
    console.error("Error in listProductService:", error);
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

    await deleteCache(`product:${productId}`);
    await deleteByPattern("products:*");
    await deleteByPattern("search:*");
    await deleteByPattern("similar:*");
    await deleteByPattern("related:*");
    await deleteCache("trending_products");
    await deleteCache("recommended_products");
    await deleteCache("top_rated_products");

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

  await deleteCache(`product:${productId}`);
  await deleteByPattern("products:*");
  await deleteByPattern("search:*");
  await deleteByPattern("similar:*");
  await deleteByPattern("related:*");
  await deleteCache("trending_products");
  await deleteCache("recommended_products");
  await deleteCache("top_rated_products");

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

//Optimized browse service for home page pagination
export const browseProductsService = async (skip = 0, limit = 12) => {
  try {
    const skipNum = parseInt(skip);
    const limitNum = parseInt(limit);

    const products = await Product.find()
      .select(
        "name price images category rating reviewCount bestseller sizes createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments();

    return {
      products,
      total,
      skip: skipNum,
      limit: limitNum,
      hasMore: skipNum + limitNum < total,
    };
  } catch (error) {
    console.error("Error in browseProductsService:", error);
    throw error;
  }
};
