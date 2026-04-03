import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, "productId is required"],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "size is required"],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 1,
    },
    priceAtAdd: {
      type: Number,
      required: [true, "priceAtAdd is required"],
      min: [0, "priceAtAdd cannot be negative"],
    },
    name: String,
    image: String,
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    updatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
);

export const Cart = mongoose.model("Cart", cartSchema);
