import {
  placeOrderService,
  placeOrderRazorpayService,
  verifyRazorpayService,
  getUserOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
} from "./order.service.js";

export const placeOrder = async (req, res) => {
  try {
    const token = req.token;
    const { amount, address } = req.body;

    const result = await placeOrderService(req.userId, amount, address);
    return res.status(201).json({ message: result.message, token });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Order Can't placed" });
  }
};

export const placeOrderRazorpay = async (req, res) => {
  try {
    const token = req.token;
    const { amount, address } = req.body;

    const order = await placeOrderRazorpayService(req.userId, amount, address);
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const result = await verifyRazorpayService(req.userId, razorpay_order_id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const userOrders = async (req, res) => {
  try {
    const token = req.token;
    const { orders } = await getUserOrdersService(req.userId);
    return res.status(200).json({ orders, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Cant fetch orders" });
  }
};

export const allOrders = async (req, res) => {
  try {
    const token = req.token;
    const { orders } = await getAllOrdersService(req.adminId);
    return res.status(200).json({ orders, token });
  } catch (error) {
    return res
      .status(404)
      .json({ message: error.message || "No orders found" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const token = req.token;

    const result = await updateOrderStatusService(orderId, status, req.adminId);
    return res.status(200).json({ message: result.message, token });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Order Status update failed" });
  }
};
