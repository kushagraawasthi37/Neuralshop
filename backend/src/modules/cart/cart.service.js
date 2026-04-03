import redisClient from "../../config/redis.js";
import { Cart } from "./cart.model.js";
import { Product } from "../product/product.model.js";
import mongoose from "mongoose";

const CART_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const getRedisKey = (userId) => `cart:${userId}`;

const buildEmptyCart = (userId) => ({
  userId,
  items: [],
  updatedAt: new Date(),
});

//Redis se aayi string data ko safe object me convert karta hai
const parseRedisCart = (payload) => {
  try {
    const parsed = JSON.parse(payload);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.items)) parsed.items = [];
    parsed.updatedAt = parsed.updatedAt
      ? new Date(parsed.updatedAt)
      : new Date();
    return parsed;
  } catch {
    return null;
  }
};

const cacheCart = async (userId, cart) => {
  if (!userId || !cart)
    throw new Error("Cannot cache cart; missing userId or cart");
  cart.updatedAt = new Date();
  await redisClient.set(
    getRedisKey(userId),
    JSON.stringify(cart),
    "EX",
    CART_TTL_SECONDS,
  );
  return cart;
};

const _modifyCartWithTransaction = async (userId, modifierFn) => {
  if (!userId) throw new Error("userId is required");
  if (typeof modifierFn !== "function")
    throw new Error("modifierFn must be a function");

  const redisKey = getRedisKey(userId);
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Redis bol raha:
      // “Agar is key ko kisi ne change kiya → mujhe batana”
      // Ye optimistic locking hai
      await redisClient.watch(redisKey);

      let cart = await getRedisCart(userId);
      if (!cart) cart = buildEmptyCart(userId);

      const modifiedCart = await modifierFn(cart);

      if (!modifiedCart || !modifiedCart.items) {
        throw new Error("Invalid cart returned from modifierFn");
      }

      modifiedCart.updatedAt = new Date();

      // Main ab ek atomic transaction start kar raha hoon
      // Ye ek command queue banata hai
      const multi = redisClient.multi();

      // Agar cart khali hai, to us key ko Redis se hata do (taaki unnecessary keys na bane)
      if (modifiedCart.items.length === 0) {
        multi.del(redisKey);
      } else {
        multi.set(
          redisKey,
          JSON.stringify(modifiedCart),
          "EX",
          CART_TTL_SECONDS,
        );

        // Abhi Redis me kuch execute nahi hua ❌
        // Bas queue me add hua hai
        // Commands tab tak run nahi honge jab tak exec() nahi aata
      }

      const results = await multi.exec();
      //  Redis internally check karta hai:
      // "Jab se WATCH laga tha, kya redisKey change hua?"

      // Case 1: NO CHANGE → SUCCESS
      // Kisi ne cart modify nahi kiya
      if (results) {
        await persistCartToMongo(userId, modifiedCart).catch((err) =>
          console.error("Failed to persist cart to Mongo:", err),
        );
        return modifiedCart;
      }

      // transaction failed due to concurrent change, retry
      // Kisi aur ne cart update kar diya
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      // otherwise, loop and retry
    } finally {
      try {
        await redisClient.unwatch(); //exec() already clears WATCH
      } catch (e) {
        // best-effort
      }
    }
  }

  throw new Error(`Cart update failed after ${maxRetries} retries`);
};

const persistCartToMongo = async (userId, cart) => {
  if (!userId || !cart) return null;
  const updated = {
    items: cart.items,
    updatedAt: cart.updatedAt || new Date(),
  };

  return Cart.findOneAndUpdate(
    { userId },
    { ...updated, userId },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
};

const getRedisCart = async (userId) => {
  const payload = await redisClient.get(getRedisKey(userId));
  if (!payload) return null;
  return parseRedisCart(payload);
};

const getMongoCart = async (userId) => {
  if (!userId) return null;
  return Cart.findOne({ userId }).lean();
};

//Checked
export const getCartService = async (userId) => {
  if (!userId) throw new Error("userId is required");

  let cart = await getRedisCart(userId);
  if (cart) return cart;

  const dbCart = await getMongoCart(userId);
  if (dbCart) {
    cart = {
      userId,
      items: dbCart.items || [],
      updatedAt: dbCart.updatedAt || new Date(),
    };
    await cacheCart(userId, cart);
    return cart;
  }

  cart = buildEmptyCart(userId);
  await cacheCart(userId, cart);
  return cart;
};

//Checked
export const addItemToCartService = async (userId, item) => {
  const { productId, size, quantity, priceAtAdd, name, image } = item || {};

  if (!productId) throw new Error("productId is required");
  if (!size) throw new Error("size is required");
  if (!["XS", "S", "M", "L", "XL", "XXL"].includes(size))
    throw new Error("size must be one of: XS, S, M, L, XL, XXL");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("quantity must be a positive number");
  if (!Number.isFinite(priceAtAdd) || priceAtAdd < 0)
    throw new Error("priceAtAdd must be a non-negative number");

  const itemData = { productId, size, quantity, priceAtAdd, name, image };

  return _modifyCartWithTransaction(userId, (cart) => {
    const existing = cart.items.find(
      (x) => x.productId === productId && x.size === size,
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push(itemData);
    }

    return cart;
  });
};

//Checked
export const updateCartItemService = async (
  userId,
  productId,
  size,
  quantity,
) => {
  if (!productId) throw new Error("productId is required");
  if (!size) throw new Error("size is required");
  if (!["XS", "S", "M", "L", "XL", "XXL"].includes(size))
    throw new Error("size must be one of: XS, S, M, L, XL, XXL");
  if (!Number.isFinite(quantity) || quantity < 0)
    throw new Error("quantity must be zero or a positive number");

  return _modifyCartWithTransaction(userId, (cart) => {
    const index = cart.items.findIndex(
      (x) => x.productId === productId && x.size === size,
    );

    if (index === -1) throw new Error("Item not found in cart");

    if (quantity === 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }

    return cart;
  });
};

//Checked
export const removeCartItemService = async (userId, productId, size) => {
  if (!productId) throw new Error("productId is required");
  if (!size) throw new Error("size is required");
  if (!["XS", "S", "M", "L", "XL", "XXL"].includes(size))
    throw new Error("size must be one of: XS, S, M, L, XL, XXL");

  return _modifyCartWithTransaction(userId, (cart) => {
    const filtered = cart.items.filter(
      (x) => !(x.productId === productId && x.size === size),
    );

    if (filtered.length === cart.items.length) {
      throw new Error("Item not found in cart");
    }

    cart.items = filtered;
    return cart;
  });
};

//Checked
export const clearCartService = async (userId) => {
  return _modifyCartWithTransaction(userId, (cart) => {
    cart.items = [];
    return cart;
  });
};

//Checked
export const validateCartService = async (userId) => {
  const cart = await getCartService(userId);
  const issues = [];

  if (!cart.items.length) {
    issues.push("Cart is empty");
  }

  for (let idx = 0; idx < cart.items.length; idx++) {
    const item = cart.items[idx];

    // 🔥 FIX: sanitize productId
    if (!item.productId) {
      issues.push(`item[${idx}] missing productId`);
      continue;
    }

    const cleanProductId = item.productId.trim();

    if (!mongoose.Types.ObjectId.isValid(cleanProductId)) {
      issues.push(`item[${idx}] invalid productId`);
      continue;
    }

    if (!item.size) {
      issues.push(`item[${idx}] missing size`);
      continue;
    }

    if (!["XS", "S", "M", "L", "XL", "XXL"].includes(item.size)) {
      issues.push(`item[${idx}] invalid size`);
      continue;
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      issues.push(`item[${idx}] invalid quantity`);
      continue;
    }

    if (!Number.isFinite(item.priceAtAdd) || item.priceAtAdd < 0) {
      issues.push(`item[${idx}] invalid priceAtAdd`);
      continue;
    }

    try {
      const product = await Product.findById(cleanProductId);

      if (!product) {
        issues.push(`item[${idx}] product not found`);
        continue;
      }

      const sizeEntry = product.sizes.find((s) => s.size === item.size);

      if (!sizeEntry) {
        issues.push(
          `item[${idx}] size ${item.size} not available for this product`,
        );
        continue;
      }

      if (item.quantity > sizeEntry.stock) {
        issues.push(
          `item[${idx}] requested quantity (${item.quantity}) exceeds available stock (${sizeEntry.stock}) for size ${item.size}`,
        );
      }
    } catch (error) {
      issues.push(`item[${idx}] error checking stock: ${error.message}`);
    }
  }

  return { valid: issues.length === 0, issues, cart };
};

//Checked
export const checkoutCartService = async (userId) => {
  const { valid, issues, cart } = await validateCartService(userId);
  if (!valid) {
    throw new Error(`Cart validation failed: ${issues.join(", ")}`);
  }

  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.priceAtAdd,
    0,
  );

  const payload = {
    userId,
    items: cart.items,
    totalItems,
    totalPrice,
    currency: "USD",
    createdAt: new Date(),
  };

  // Constraint from requirement: Clear Redis cart after checkout to avoid duplicate flows.
  await clearCartService(userId);

  return payload;
};

//Checked
export const syncCartService = async (userId) => {
  const cart = await getCartService(userId);
  await persistCartToMongo(userId, cart);
  return cart;
};

//Checked
export const getCartSummaryService = async (userId) => {
  const cart = await getCartService(userId);
  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.priceAtAdd,
    0,
  );

  return { userId, totalItems, totalPrice, itemCount: cart.items.length };
};

export const mergeCartService = async (userId, guestCartPayload) => {
  const userCart = await getCartService(userId);

  if (!guestCartPayload || !Array.isArray(guestCartPayload.items)) {
    return userCart;
  }

  guestCartPayload.items.forEach((guestItem) => {
    if (
      !guestItem.productId ||
      !guestItem.size ||
      !Number.isFinite(guestItem.quantity)
    )
      return;

    const existing = userCart.items.find(
      (item) =>
        item.productId === guestItem.productId && item.size === guestItem.size,
    );

    if (existing) {
      existing.quantity += guestItem.quantity;
      existing.priceAtAdd = guestItem.priceAtAdd || existing.priceAtAdd;
      existing.name = guestItem.name || existing.name;
      existing.image = guestItem.image || existing.image;
    } else {
      userCart.items.push({
        productId: guestItem.productId,
        size: guestItem.size,
        quantity: guestItem.quantity,
        priceAtAdd: guestItem.priceAtAdd ?? 0,
        name: guestItem.name,
        image: guestItem.image,
      });
    }
  });

  userCart.updatedAt = new Date();
  await cacheCart(userId, userCart);
  return userCart;
};
