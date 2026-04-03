<<<<<<< HEAD
import { User } from "../user/user.model.js";
=======
import User from "../user/user.model.js";
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567

export const addToCartService = async (userId, itemId, size) => {
  try {
    const userData = await User.findById(userId);
    if (!userData) {
      throw new Error("User not found");
    }

    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await User.findByIdAndUpdate(userId, { cartData });
    return { message: "Added to cart" };
  } catch (error) {
    throw error;
  }
};

export const updateCartService = async (userId, itemId, size, quantity) => {
  try {
    const userData = await User.findById(userId);
    if (!userData) {
      throw new Error("User not found");
    }

    let cartData = userData.cartData;
    cartData[itemId][size] = quantity;

    await User.findByIdAndUpdate(userId, { cartData });
    return { message: "Cart updated" };
  } catch (error) {
    throw error;
  }
};

export const getUserCartService = async (userId) => {
  try {
    const userData = await User.findById(userId);
    if (!userData) {
      throw new Error("User not found");
    }
    const cartData = userData.cartData;
    return { cartData };
  } catch (error) {
    throw error;
  }
};
