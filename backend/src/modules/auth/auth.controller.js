import {
  registerUserService,
  loginUserService,
  googleLoginService,
  registerAdminService,
  loginAdminService,
  getCurrentAdminService,
  verifyEmailService,
  requestPasswordResetService,
  resetPasswordService,
  verifyAdminEmailService,
  resendOtpService,
  verifyResetOtpService,
} from "./auth.service.js";
import config from "../../config/environment.config.js";
import { OTP_TYPES, ROLES } from "./otp.service.js";
import jwt from "jsonwebtoken";
import redisClient from "../../config/redis.js";

const isProd = config.app.isProduction;

const setUserCookie = (res, token) => {
  res.cookie("userToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const setAdminCookie = (res, token) => {
  res.cookie("adminToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

//Checked
export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUserService(name, email, password);

    setUserCookie(res, token);
    return res.status(201).json({
      user,
      token,
      message: "Verification OTP has been sent on Email",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration error" });
  }
};

//Checked
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyEmailService(email, otp);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Verification failed" });
  }
};

//Checked
export const resendOtp = async (req, res) => {
  try {
    const { email, type, role } = req.body;

    // 🛑 Basic validation (important)
    if (!email || !type || !role) {
      return res.status(400).json({
        message: "email, type and role are required",
      });
    }

    // 🛑 Type validation
    if (!Object.values(OTP_TYPES).includes(type)) {
      return res.status(400).json({
        message: "Invalid OTP type",
      });
    }

    // 🛑 Role validation
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    await resendOtpService(email, type, role);

    return res.status(200).json({
      message: "OTP resent successfully 🚀",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Resend OTP failed",
    });
  }
};

//Checked
export const verifyAdminEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyAdminEmailService(email, otp);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Verification failed" });
  }
};

//Checked
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUserService(email, password);

    setUserCookie(res, token);
    return res
      .status(200)
      .json({ user, token, message: "User Logged in Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Login error" });
  }
};

//Checked
export const userLogout = async (req, res) => {
  try {
    const token = req.token;

    if (token) {
      const decoded = jwt.decode(token);
      let ttlSeconds = 3600;

      if (decoded?.exp) {
        const remaining = decoded.exp * 1000 - Date.now();
        if (remaining > 0) {
          ttlSeconds = Math.ceil(remaining / 1000);
        }
      }

      await redisClient.set(
        `blacklisted_token:${token}`,
        "1",
        "EX",
        ttlSeconds,
      );
    }

    res.clearCookie("userToken");

    return res.status(200).json({
      message: "User logout successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    const token = req.token;

    if (token) {
      const decoded = jwt.decode(token);
      let ttlSeconds = 3600;

      if (decoded?.exp) {
        const remaining = decoded.exp * 1000 - Date.now();
        if (remaining > 0) {
          ttlSeconds = Math.ceil(remaining / 1000);
        }
      }

      await redisClient.set(
        `blacklisted_token:${token}`,
        "1",
        "EX",
        ttlSeconds,
      );
    }

    res.clearCookie("adminToken");

    return res.status(200).json({
      message: "Admin logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { user, token } = await googleLoginService(name, email);

    setUserCookie(res, token);
    return res.status(200).json({ user, token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Google authentication error" });
  }
};

//Checked
export const adminRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { admin, token } = await registerAdminService(name, email, password);

    setAdminCookie(res, token);
    return res.status(201).json({
      admin,
      token,
      message: "Email Verification code is sent successfully",
    });
    return res.status(201).json({ admin, token });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration Failed" });
  }
};

//Checked
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { admin, token } = await loginAdminService(email, password);

    setAdminCookie(res, token);
    return res.status(200).json({ admin, token });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Login error" });
  }
};

//Checked
export const requestPasswordReset = async (req, res) => {
  try {
    const { email, role } = req.body;
    const result = await requestPasswordResetService(email, role);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Request failed" });
  }
};

//Checked
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;
    const result = await resetPasswordService(email, otp, newPassword, role);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Reset failed" });
  }
};

//Checked

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    const result = await verifyResetOtpService(email, otp, role);
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "OTP verification failed" });
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
