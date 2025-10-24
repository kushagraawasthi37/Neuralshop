import { request } from "express";
import User from "../model/user.model.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { genToken } from "../config/token.js";

export const registeration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({
        message: "User already exist",
      });
    }

    //Check kare ki wo email format mai hai ya nahi
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Enter valid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be have atleast size 8",
      });
    }
    let hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    let token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.log("Something went wrong. Can't register user");
    return res.status(500).json({ message: `Register error ${error.message}` });
  }
};
