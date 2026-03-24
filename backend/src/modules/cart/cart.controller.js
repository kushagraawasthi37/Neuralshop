import {
  addToCartService,
  updateCartService,
  getUserCartService,
} from "./cart.service.js";

export const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const token = req.token;

    await addToCartService(req.userId, itemId, size);
    return res.status(201).json({ message: "Added to cart", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Add to cart failed" });
  }
};

export const UpdateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const token = req.token;

    await updateCartService(req.userId, itemId, size, quantity);
    return res.status(200).json({ message: "cart updated", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "updateCart error" });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const token = req.token;
    const { cartData } = await getUserCartService(req.userId);

    return res.status(200).json({ cartData, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "getUserCart error" });
  }
};
