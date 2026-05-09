import mongoose from "mongoose";

const behaviorEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    sessionId: { type: String, required: true, index: true },
    event: {
      type: String,
      enum: [
        "product_view",
        "add_to_cart",
        "remove_from_cart",
        "wishlist_add",
        "wishlist_remove",
        "search",
        "checkout_start",
        "order_placed",
      ],
      required: true,
    },
    productId: { type: String, default: null },
    metadata: {
      duration: { type: Number, default: 0 },
      searchQuery: { type: String, default: "" },
      category: { type: String, default: "" },
      subCategory: { type: String, default: "" },
      price: { type: Number, default: 0 },
      size: { type: String, default: "" },
      productName: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

// Compound indexes for fast lookups
behaviorEventSchema.index({ userId: 1, createdAt: -1 });
behaviorEventSchema.index({ sessionId: 1, createdAt: -1 });

// Auto-expire events after 60 days
behaviorEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 },
);

export const BehaviorEvent = mongoose.model("BehaviorEvent", behaviorEventSchema);
