import mongoose from "mongoose";
import { Wishlist } from "./wishlist.model.js";
import { Product } from "../product/product.model.js";
import { ApiError } from "../../utils/api-error.js";
import { deleteCache } from "../../utils/cache.js";

export const getWishlistService = async (userId) => {
  try {
    let wishlist = await Wishlist.findOne({ userId }).populate(
      "items.productId",
      "name price category subCategory images rating reviewCount bestseller",
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [],
      });
    }

    return wishlist;
  } catch (error) {
    throw error;
  }
};

export const addToWishlistService = async (userId, productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found", [], "wishlist");
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        items: [{ productId }],
      });
    } else {
      const exists = wishlist.items.some(
        (item) => item.productId.toString() === productId.toString(),
      );

      if (exists) {
        throw new ApiError(409, "Product already in wishlist", [], "wishlist");
      }

      wishlist.items.push({ productId });
      await wishlist.save();
    }

    await deleteCache(`wishlist:${userId}`);

    return await Wishlist.findOne({ userId }).populate(
      "items.productId",
      "name price category subCategory images rating reviewCount bestseller",
    );
  } catch (error) {
    throw error;
  }
};

export const removeFromWishlistService = async (userId, productId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      throw new ApiError(404, "Wishlist not found", [], "wishlist");
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId.toString(),
    );

    await wishlist.save();
    await deleteCache(`wishlist:${userId}`);

    return await Wishlist.findOne({ userId }).populate(
      "items.productId",
      "name price category subCategory images rating reviewCount bestseller",
    );
  } catch (error) {
    throw error;
  }
};

export const isInWishlistService = async (userId, productId) => {
  try {
    const wishlist = await Wishlist.findOne({
      userId,
      "items.productId": new mongoose.Types.ObjectId(productId),
    });

    return !!wishlist;
  } catch (error) {
    throw error;
  }
};

export const clearWishlistService = async (userId) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true },
    );

    if (!wishlist) {
      throw new ApiError(404, "Wishlist not found", [], "wishlist");
    }

    await deleteCache(`wishlist:${userId}`);

    return wishlist;
  } catch (error) {
    throw error;
  }
};
