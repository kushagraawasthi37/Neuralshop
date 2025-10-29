import Order from "../model/order.model.js";
import User from "../model/user.model.js";
import Product from "../model/product.model.js";
import razorpay from "razorpay";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const currency = "inr";

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// for User
export const placeOrder = async (req, res) => {
  try {
    const token = req.token;
    const { amount, address } = req.body;
    const userId = req.userId; // Fetch user's cartData

    const user = await User.findById(userId);
    if (!user || !user.cartData || Object.keys(user.cartData).length === 0) {
      console.log("Cart is empty.Add Some item for order");
      return res.status(400).json({ message: "Cart empty" });
    }

    const cartData = user.cartData;

    const items = [];
    const productIdSet = new Set(); // For products array

    for (const productId in cartData) {
      for (const size in cartData[productId]) {
        const quantity = cartData[productId][size];
        if (quantity > 0) {
          // Fetch product details for name, price, image1, etc.
          const product = await Product.findById(productId);
          if (!product) continue;

          items.push({
            id: product._id,
            name: product.name,
            size,
            quantity,
            price: product.price,
            image1: product.image1, // Add product image URL here
          });

          productIdSet.add(product._id.toString());
        }
      }
    }

    if (items.length === 0) {
      // console.log("Cart is empty Or invalid.Add Some item for order");

      return res.status(400).json({ message: "Cart empty" });
    }

    // Prepare products array for Order document as [{ id: ObjectId }]
    const products = Array.from(productIdSet).map((id) => ({ id }));

    // Prepare order data
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

    // Save new order
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Clear user cart after order is placed
    await User.findByIdAndUpdate(userId, { cartData: {} });

    // console.log("Order placed succesfully");
    return res
      .status(201)
      .json({ message: "Order placed successfully", token });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: "Order Can't placed" });
  }
};

export const placeOrderRazorpay = async (req, res) => {
  try {
    const token = req.token;
    const { amount, address } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || !user.cartData || Object.keys(user.cartData).length === 0) {
      return res.status(400).json({ message: "Cart empty" });
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
      return res.status(400).json({ message: "Empty Cart" });
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

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        return res.status(500).json(error);
      }
      res.status(200).json(order);
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const order = await Order.findById(orderInfo.receipt);
      if (order) {
        order.payment = true; /* // Mark payment as received // Optional: Update all product statuses (commented below if you want per-product status change)
        order.products = order.products.map(product => ({
          ...product.toObject(),
          status: "Paid",
        }));
        */
        await order.save();
      }
      await User.findByIdAndUpdate(userId, { cartData: {} });
      res.status(200).json({ message: "Payment Successful" });
    } else {
      res.json({ message: "Payment Failed" });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId });

    const token = req.token;
    return res.status(200).json({ orders, token });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ message: "Cant fetch orders", error });
  }
};

//For admin
export const allOrders = async (req, res) => {
  try {
    const token = req.token;
    const adminId = req.adminId;

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
          "productDetails.0": { $exists: true }, // Keep only orders with any owned product
        },
      },
    ]);

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this admin" });
    }

    // No further filtering needed; already filtered in aggregation
    return res.status(200).json({ orders, token });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong.Try again later" });
  }
};

// Admin: Update order status only if owns the specific product in order
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const adminId = req.adminId;

    const token = req.token;
    const order = await Order.findById(orderId).populate("products.id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const ownsProduct = order.products.some(
      (p) => p.id.owner.toString() === adminId.toString()
    );

    if (!ownsProduct) {
      return res.status(403).json({
        message: "Not authorized to update this order",
      });
    }

    await Order.findByIdAndUpdate(orderId, { status });

    return res.status(200).json({ message: "Status Updated", token });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ message: "Order Stattus update failed" });
  }
};

/*

const orderSchema = new mongoose.Schema(
  {
    // ... other fields ...
    products: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        status: {  
          type: String,
          default: "Order Placed",
        },
      },
    ],
  },
  { timestamps: true }
);

export const updateProductStatus = async (req, res) => {
  try {
    const { orderId, productIds, status } = req.body; // productIds is array of product IDs to update
    const adminId = req.adminId;

    const order = await Order.findById(orderId).populate("products.id");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check that admin owns all requested products to update
    const ownsAllRequested = productIds.every((pid) =>
      order.products.some(
        (p) =>
          p.id._id.toString() === pid && p.id.owner.toString() === adminId.toString()
      )
    );

    if (!ownsAllRequested) {
      return res.status(403).json({ message: "Not authorized to update some products" });
    }

    // Update status on specific products only
    order.products = order.products.map((p) => {
      if (productIds.includes(p.id._id.toString())) {
        return { ...p.toObject(), status }; // update status
      }
      return p;
    });

    await order.save();

    return res.status(200).json({ message: "Product status(es) updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating product status" });
  }
};

*/
