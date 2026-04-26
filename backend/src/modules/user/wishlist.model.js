import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One wishlist per user
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false, // Disable _id for sub-documents
      },
    ],
  },
  { timestamps: true },
);

// Indexes
wishlistSchema.index({ "items.productId": 1 });
wishlistSchema.index({ updatedAt: -1 });

// Prevent duplicate products in wishlist
wishlistSchema.pre("save", function (next) {
  const ids = this.items.map((item) => item.productId.toString());
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    const error = new Error("Cannot add duplicate products to wishlist");
    next(error);
  } else {
    next();
  }
});

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
