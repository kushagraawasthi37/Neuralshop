import User from "../model/user.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { genToken, genToken1 } from "../config/token.js";
import Admin from "../model/admin.model.js";

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter valid Email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be atleast of 9 letters" });
    }
    let hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashPassword });
    let token = await genToken(user._id);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ user, token });
  } catch (error) {
    console.log("registration error");
    return res.status(500).json({ message: `registration error ` });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect Credentials" });
    }
    let token = await genToken(user._id);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ user, token });
  } catch (error) {
    // console.log("login error");

    return res.status(500).json({ message: `Login error ` });
  }
};
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
    // console.log("logOut error", error);
    return res.status(500).json({ message: `Logout error` });
  }
};

export const googleLogin = async (req, res) => {
  try {
    let { name, email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: "google",
      });
    }

    let token = await genToken(user._id);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ user, token });
  } catch (error) {
    console.log("googleLogin error", error);
    return res.status(500).json({ message: `Google authentication error ` });
  }
};

export const adminRegistration = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    const existAdmin = await Admin.findOne({ email });
    if (existAdmin) {
      return res.status(400).json({ message: "Admin already exist" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter valid Email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 9 letter long" });
    }
    let hashPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, password: hashPassword });
    let token = await genToken1(email);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("login working");
    return res.status(201).json({ admin, token });
  } catch (error) {
    console.log("registration error");
    return res.status(500).json({ message: `registration Failed` });
  }
};

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin already exist" });
    }
    // console.log(admin);
    // console.log("Entered password:", `"${password}"`);
    // console.log("Stored password:", `"${admin.password}"`);

    let isMatch = await bcrypt.compare(password, admin.password);
    // console.log("password correct ", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    let token = await genToken1(admin.email);
    const isProd = process.env.NODE_ENV === "production";
    // console.log(process.env.NODE_ENV);
    // console.log(isProd);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // console.log("login working");
    return res.status(201).json({ admin, token });
  } catch (error) {
    // console.log("login error", error);
    return res.status(500).json({ message: `Login error` });
  }
};
