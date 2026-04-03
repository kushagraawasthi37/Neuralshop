import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
<<<<<<< HEAD
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
=======
      required: [true, "Admin name is required"],
      trim: true,
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
    },

    email: {
      type: String,
<<<<<<< HEAD
      required: [true, "Email is required"],
=======
      required: [true, "Admin email is required"],
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
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
<<<<<<< HEAD
      minlength: [6, "Password must be at least 6 characters"],
=======
      minlength: [8, "Password must be at least 8 characters"],
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
      select: false, // Don't return password by default
    },

    role: {
      type: String,
<<<<<<< HEAD
      enum: ["admin"],
=======
      enum: {
        values: ["admin", "super_admin"],
        message: "Role must be admin or super_admin",
      },
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

<<<<<<< HEAD
    emailVerified: {
      type: Boolean,
      default: false,
    },
=======
    permissions: [String], // Fine-grained permission control
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
  },
  { timestamps: true },
);

<<<<<<< HEAD
// Indexes
// adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ createdAt: -1 });

export const Admin = mongoose.model("Admin", adminSchema);
=======
// 🔥 Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ createdAt: -1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
