import {
  registerUserService,
  loginUserService,
  googleLoginService,
  registerAdminService,
  loginAdminService,
  getCurrentAdminService,
} from "./auth.service.js";
import config from "../../config/environment.config.js";

const isProd = config.app.isProduction;

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUserService(name, email, password);

    setCookie(res, token);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUserService(email, password);

    setCookie(res, token);
    return res.status(200).json({ user, token });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Login error" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Logout error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { user, token } = await googleLoginService(name, email);

    setCookie(res, token);
    return res.status(200).json({ user, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Google authentication error" });
  }
};

export const adminRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { admin, token } = await registerAdminService(name, email, password);

    setCookie(res, token);
    return res.status(201).json({ admin, token });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration Failed" });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { admin, token } = await loginAdminService(email, password);

    setCookie(res, token);
    return res.status(200).json({ admin, token });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Login error" });
  }
};

export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await getCurrentAdminService(req.email);
    const token = req.token;

    return res.status(200).json({
      admin,
      token,
    });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Something went wrong.Login again" });
  }
};
