import { User } from "../user/user.model.js";
import Admin from "./auth.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { genToken, genToken1 } from "../../config/jwt.js";
import {
  generateAndSendOTP,
  verifyOTP,
  resendOTP,
  OTP_TYPES,
  ROLES,
} from "./otp.service.js";

//Main services

//Checked
export const registerUserService = async (name, email, password) => {
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      throw new Error("User already exist");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Enter valid Email");
    }
    if (password.length < 8) {
      throw new Error("Password must be atleast 8 characters");
    }

    // Check OTP request limit
    await generateAndSendOTP({
      email,
      type: OTP_TYPES.VERIFY,
      role: ROLES.USER,
    });

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashPassword });

    const token = await genToken(user._id);
    return { user, token };
  } catch (error) {
    throw error;
  }
};

//Checked
export const loginUserService = async (email, password) => {
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("User not Found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Incorrect Credentials");
    }

    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }
    const token = genToken(user._id);
    return { user, token };
  } catch (error) {
    throw error;
  }
};

//Checked
export const resendOtpService = async (email, type, role) => {
  return await resendOTP(email, type, role);
};

//Checked
export const verifyEmailService = async (email, otp) => {
  return verifyOTP({
    email,
    otp,
    type: OTP_TYPES.VERIFY,
    role: ROLES.USER,
    model: User,
  });
};

//Checked
export const registerAdminService = async (name, email, password) => {
  try {
    const existAdmin = await Admin.findOne({ email });
    if (existAdmin) {
      throw new Error("Admin already exist");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Enter valid Email");
    }
    if (password.length < 8) {
      throw new Error("Password must be atleast 8 characters");
    }

    await generateAndSendOTP({
      email,
      type: OTP_TYPES.VERIFY,
      role: ROLES.ADMIN,
    });

    const hashPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashPassword });

    const token = await genToken1(email, admin._id.toString());
    return { admin, token };
  } catch (error) {
    throw error;
  }
};

//Checked
export const verifyAdminEmailService = async (email, otp) => {
  return verifyOTP({
    email,
    otp,
    type: OTP_TYPES.VERIFY,
    role: ROLES.ADMIN,
    model: Admin,
  });
};

//Checked
export const loginAdminService = async (email, password) => {
  try {
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      throw new Error("Admin not found");
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }
    const token = await genToken1(admin.email, admin._id.toString());
    return { admin, token };
  } catch (error) {
    throw error;
  }
};

//Checked For both Admin and User
export const requestPasswordResetService = async (email, role) => {
  try {
    let user;

    if (role === "user") {
      user = await User.findOne({ email });
    }
    if (role === "admin") {
      user = await Admin.findOne({ email });
    }
    if (!user) {
      throw new Error("User not found");
    }

    await generateAndSendOTP({
      email,
      type: OTP_TYPES.RESET,
      role,
    });

    return { message: "Password reset OTP sent to your email" };
  } catch (error) {
    throw error;
  }
};

//Checked For both Admin and User
export const resetPasswordService = async (email, otp, newPassword, role) => {
  try {
    let model = Admin;
    if (role === "user") {
      model = User;
    }
    await verifyOTP({
      email,
      otp,
      type: OTP_TYPES.RESET,
      role,
      model,
    });

    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    let user;

    if (role === "user") {
      user = await User.findOneAndUpdate(
        { email },
        { password: hashPassword },
        { new: true },
      );
    } else {
      user = await Admin.findOneAndUpdate(
        { email },
        { password: hashPassword },
        { new: true },
      );
    }

    if (!user) {
      throw new Error("User not found");
    }
    return { message: "Password reset successfully" };
  } catch (error) {
    throw error;
  }
};

//Not Checked
export const googleLoginService = async (name, email) => {
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: "google",
      });
    }
    const token = await genToken(user._id);
    return { user, token };
  } catch (error) {
    throw error;
  }
};

//Current Admin
export const getCurrentAdminService = async (email) => {
  try {
    const admin = await Admin.findOne({ email }).select("-password");
    if (!admin) {
      throw new Error("Admin not found");
    }
    return admin;
  } catch (error) {
    throw error;
  }
};
