import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },

    // 🔐 Authentication provider
    authProvider: {
      type: String,
      enum: {
        values: ["local", "google", "github"],
        message: "Auth provider must be local, google, or github",
      },
      default: "local",
    },

    // 👤 User role
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be user or admin",
      },
      default: "user",
    },

    // 📸 Profile picture
    profilePicture: String,

    // 📞 Contact information
    phone: String,

    // 🏠 Address (stored as JSON for flexibility)
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // 🔐 Security
    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    // 🔑 Password reset token
    resetToken: String,
    resetTokenExpiry: Date,

    // ⚠️ NOTE: Cart is in Redis, NOT in this schema
    // Use: cart:userId → Redis
  },
  { timestamps: true },
);

// 🔥 Indexes for optimal performance
// userSchema.index({ email: 1 });
userSchema.index({ authProvider: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

// Middleware: Hash password before save (handled in service layer)
// Middleware: Update updatedAt timestamp

export const User = mongoose.model("User", userSchema);
