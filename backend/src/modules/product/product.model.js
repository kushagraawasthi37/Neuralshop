import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Product must have at least one image",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    subCategory: {
      type: String,
      required: [true, "SubCategory is required"],
      trim: true,
    },

    // 🔥 Size & Stock tracking (important for inventory)
    sizes: [
      {
        size: {
          type: String,
          required: true,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },
        _id: false, // Disable _id for sub-documents
      },
    ],

    bestseller: {
      type: Boolean,
      default: false,
    },

    // 🔐 Owner reference
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📊 Rating and reviews metadata
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // 🔍 SEO fields
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    tags: [String],
  },
  { timestamps: true },
);

// 🔥 Indexes for optimal query performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ owner: 1 });
productSchema.index({ price: 1 });
productSchema.index({ bestseller: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "sizes.size": 1 });

export const Product = mongoose.model("Product", productSchema);
