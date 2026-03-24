import { User } from "../user/user.model.js";
import Admin from "./auth.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { genToken, genToken1 } from "../../config/jwt.js";

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
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashPassword });
    const token = await genToken(user._id);
    return { user, token };
  } catch (error) {
    throw error;
  }
};

export const loginUserService = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not Found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect Credentials");
    }
    const token = await genToken(user._id);
    return { user, token };
  } catch (error) {
    throw error;
  }
};

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
    const hashPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashPassword });
    const token = await genToken1(email);
    return { admin, token };
  } catch (error) {
    throw error;
  }
};

export const loginAdminService = async (email, password) => {
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error("Admin not found");
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }
    const token = await genToken1(admin.email);
    return { admin, token };
  } catch (error) {
    throw error;
  }
};

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
