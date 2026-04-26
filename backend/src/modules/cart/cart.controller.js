import {
  getCartService,
  addItemToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  validateCartService,
  checkoutCartService,
  syncCartService,
  mergeCartService,
  getCartSummaryService,
} from "./cart.service.js";

//Checked
export const getCart = async (req, res) => {
  try {
    const cart = await getCartService(req.userId);
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Checked
export const addItem = async (req, res) => {
  try {
    let { productId, size, quantity, priceAtAdd, name, image } = req.body;

    quantity = Number(quantity);
    priceAtAdd = Number(priceAtAdd);

    const cart = await addItemToCartService(req.userId, {
      productId,
      size,
      quantity,
      priceAtAdd,
      name,
      image,
    });
    return res.status(201).json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//Checked
export const updateItem = async (req, res) => {
  try {
    let { productId, size, quantity } = req.body;
    quantity = Number(quantity);
    const cart = await updateCartItemService(
      req.userId,
      productId,
      size,
      quantity,
    );
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//Checked
export const removeItem = async (req, res) => {
  try {
    const { productId, size } = req.body;
    const cart = await removeCartItemService(req.userId, productId, size);
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//Checked
export const clearCart = async (req, res) => {
  try {
    const cart = await clearCartService(req.userId);
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Checked
export const validateCart = async (req, res) => {
  try {
    const result = await validateCartService(req.userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//Checked
export const checkout = async (req, res) => {
  try {
    const orderPayload = await checkoutCartService(req.userId);
    return res.status(200).json({ order: orderPayload });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const syncCart = async (req, res) => {
  try {
    const cart = await syncCartService(req.userId);
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//User login nahi hai aur guest cart hai, toh usko user cart ke sath merge karna hai. User login hone ke baad ye endpoint call hoga with guest cart data.
//For future use when we want to merge guest cart with user cart after login/signup
export const mergeCart = async (req, res) => {
  try {
    const { guestCart } = req.body;
    const cart = await mergeCartService(req.userId, guestCart);
    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const summary = async (req, res) => {
  try {
    const summaryResponse = await getCartSummaryService(req.userId);
    return res.status(200).json(summaryResponse);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
