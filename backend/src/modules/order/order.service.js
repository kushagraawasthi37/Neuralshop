<<<<<<< HEAD
import { Order } from "./order.model.js";
import { User } from "../user/user.model.js";
import { Product } from "../product/product.model.js";
=======
import Order from "./order.model.js";
import User from "../user/user.model.js";
import Product from "../product/product.model.js";
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
import razorpay from "razorpay";
import mongoose from "mongoose";
import config from "../../config/environment.config.js";

const currency = "inr";

// Initialize Razorpay only if credentials are provided
let razorpayInstance = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
  razorpayInstance = new razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

export const placeOrderService = async (userId, amount, address) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.cartData || Object.keys(user.cartData).length === 0) {
      throw new Error("Cart empty");
    }

    const cartData = user.cartData;
    const items = [];
    const productIdSet = new Set();

    for (const productId in cartData) {
      for (const size in cartData[productId]) {
        const quantity = cartData[productId][size];
        if (quantity > 0) {
          const product = await Product.findById(productId);
          if (!product) continue;

          items.push({
            id: product._id,
            name: product.name,
            size,
            quantity,
            price: product.price,
            image1: product.image1,
          });

          productIdSet.add(product._id.toString());
        }
      }
    }

    if (items.length === 0) {
      throw new Error("Cart empty");
    }

    const products = Array.from(productIdSet).map((id) => ({ id }));

    const orderData = {
      items,
      products,
      amount,
      userId,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    await User.findByIdAndUpdate(userId, { cartData: {} });

    return { message: "Order placed successfully", order: newOrder };
  } catch (error) {
    throw error;
  }
};

export const placeOrderRazorpayService = async (userId, amount, address) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.cartData || Object.keys(user.cartData).length === 0) {
      throw new Error("Cart empty");
    }

    const cartData = user.cartData;
    const items = [];
    const productIdSet = new Set();

    for (const productId in cartData) {
      for (const size in cartData[productId]) {
        const quantity = cartData[productId][size];
        if (quantity > 0) {
          const product = await Product.findById(productId);
          if (!product) continue;

          items.push({
            id: product._id,
            name: product.name,
            size,
            quantity,
            price: product.price,
            image1: product.image1,
          });

          productIdSet.add(product._id.toString());
        }
      }
    }

    if (items.length === 0) {
      throw new Error("Empty Cart");
    }

    const products = Array.from(productIdSet).map((id) => ({
      id,
      status: "Order Placed",
    }));

    const orderData = {
      items,
      products,
      amount,
      userId,
      address,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    return new Promise((resolve, reject) => {
      if (!razorpayInstance) {
        reject(
          new Error(
            "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
          ),
        );
        return;
      }
      razorpayInstance.orders.create(options, (error, order) => {
        if (error) {
          reject(error);
        } else {
          resolve(order);
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

export const verifyRazorpayService = async (userId, razorpayOrderId) => {
  try {
    if (!razorpayInstance) {
      throw new Error(
        "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
      );
    }
    const orderInfo = await razorpayInstance.orders.fetch(razorpayOrderId);

    if (orderInfo.status === "paid") {
      const order = await Order.findById(orderInfo.receipt);
      if (order) {
        order.payment = true;
        await order.save();
      }
      await User.findByIdAndUpdate(userId, { cartData: {} });
      return { message: "Payment Successful" };
    } else {
      return { message: "Payment Failed" };
    }
  } catch (error) {
    throw error;
  }
};

export const getUserOrdersService = async (userId) => {
  try {
    const orders = await Order.find({ userId });
    return { orders };
  } catch (error) {
    throw error;
  }
};

export const getAllOrdersService = async (adminId) => {
  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          productDetails: {
            $filter: {
              input: "$productDetails",
              as: "pd",
              cond: {
                $eq: ["$$pd.owner", new mongoose.Types.ObjectId(adminId)],
              },
            },
          },
        },
      },
      {
        $match: {
          "productDetails.0": { $exists: true },
        },
      },
    ]);

    if (!orders.length) {
      throw new Error("No orders found for this admin");
    }

    return { orders };
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatusService = async (orderId, status, adminId) => {
  try {
    const order = await Order.findById(orderId).populate("products.id");

    if (!order) {
      throw new Error("Order not found");
    }

    const ownsProduct = order.products.some(
      (p) => p.id.owner.toString() === adminId.toString(),
    );

    if (!ownsProduct) {
      throw new Error("Not authorized to update this order");
    }

    await Order.findByIdAndUpdate(orderId, { status });

    return { message: "Status Updated" };
  } catch (error) {
    throw error;
  }
};
