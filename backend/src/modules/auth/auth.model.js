import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },

    role: {
      type: String,
      enum: {
        values: ["admin", "super_admin"],
        message: "Role must be admin or super_admin",
      },
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: [String], // Fine-grained permission control
  },
  { timestamps: true },
);

// 🔥 Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ createdAt: -1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
