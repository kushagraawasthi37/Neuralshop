import User from "../user/user.model.js";

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
