<<<<<<< HEAD
import jwt from "jsonwebtoken";
import redisClient from "../../config/redis.js";
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
import {
  registerUserService,
  loginUserService,
  googleLoginService,
  registerAdminService,
  loginAdminService,
  getCurrentAdminService,
<<<<<<< HEAD
  verifyEmailService,
  requestPasswordResetService,
  resetPasswordService,
  verifyAdminEmailService,
  resendOtpService,
  getCurrentUserService,
} from "./auth.service.js";
import config from "../../config/environment.config.js";
import { OTP_TYPES, ROLES } from "./otp.service.js";
=======
} from "./auth.service.js";
import config from "../../config/environment.config.js";
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567

const isProd = config.app.isProduction;

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

<<<<<<< HEAD
//Checked
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUserService(name, email, password);

    setCookie(res, token);
<<<<<<< HEAD
    return res.status(201).json({
      user,
      token,
      message: "Verification OTP has been sent on Email",
    });
=======
    return res.status(201).json({ user, token });
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration error" });
  }
};

<<<<<<< HEAD
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
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUserService(email, password);

    setCookie(res, token);
<<<<<<< HEAD
    return res
      .status(200)
      .json({ user, token, message: "User Logged in Successfully" });
=======
    return res.status(200).json({ user, token });
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
  } catch (error) {
    return res.status(400).json({ message: error.message || "Login error" });
  }
};

<<<<<<< HEAD
//Checked
export const logOut = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1].trim()
        : null);

    if (token) {
      const decoded = jwt.decode(token);
      const expiresAt = decoded?.exp ? decoded.exp * 1000 : null;
      let ttlSeconds = 60 * 60; // default to 1 hour

      if (expiresAt) {
        const remainingMs = expiresAt - Date.now();
        if (remainingMs > 0) {
          ttlSeconds = Math.ceil(remainingMs / 1000);
        }
      }

      await redisClient.set(
        `blacklisted_token:${token}`,
        "1",
        "EX",
        ttlSeconds,
      );
    }

    res.clearCookie("token");
    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
=======
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "logout successful" });
  } catch (error) {
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
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

<<<<<<< HEAD
//Checked
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
export const adminRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { admin, token } = await registerAdminService(name, email, password);

    setCookie(res, token);
<<<<<<< HEAD
    return res.status(201).json({
      admin,
      token,
      message: "Email Verification code is sent successfully",
    });
=======
    return res.status(201).json({ admin, token });
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Registration Failed" });
  }
};

<<<<<<< HEAD
//Checked
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
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

<<<<<<< HEAD
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

=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
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
<<<<<<< HEAD

export const getCurrentUser = async (req, res) => {
  try {
    const admin = await getCurrentUserService(req.userId);
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
=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
