import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      required: [true, "Admin name is required"],
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
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },

    role: {
      type: String,
      enum: ["admin"],
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

    emailVerified: {
      type: Boolean,
      default: false,
    },
    permissions: [String], // Fine-grained permission control
  },
  { timestamps: true },
);

adminSchema.index({ createdAt: -1 });


const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
