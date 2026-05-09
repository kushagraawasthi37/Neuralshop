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
import { logAuthEvent, logError } from "../../utils/logger.js";

export const registerUserService = async (name, email, password) => {
  try {
    console.log(`[AUTH] Register attempt — email: ${email}`);

    const existUser = await User.findOne({ email });
    if (existUser) {
      console.warn(`[AUTH] Register failed — user already exists: ${email}`);
      throw new Error("User already exist");
    }
    if (!validator.isEmail(email)) {
      console.warn(`[AUTH] Register failed — invalid email format: ${email}`);
      throw new Error("Enter valid Email");
    }
    if (password.length < 8) {
      console.warn(`[AUTH] Register failed — password too short: ${email}`);
      throw new Error("Password must be atleast 8 characters");
    }

    await generateAndSendOTP({
      email,
      type: OTP_TYPES.VERIFY,
      role: ROLES.USER,
    });

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashPassword });

    logAuthEvent({ event: "register", email, userId: user._id, status: "success" });
    console.log(`[AUTH] Register success — userId: ${user._id}, email: ${email}`);

    const token = await genToken(user._id);
    return { user, token };
  } catch (error) {
    logError("[AUTH] registerUserService error", error, { email });
    throw error;
  }
};

export const loginUserService = async (email, password) => {
  try {
    const normalizedEmail = email.toLowerCase();
    console.log(`[AUTH] Login attempt — email: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      console.warn(`[AUTH] Login failed — user not found in DB: ${normalizedEmail}`);
      logAuthEvent({ event: "login", email: normalizedEmail, status: "failed", reason: "user_not_found" });
      throw new Error("User not Found");
    }

    console.log(`[AUTH] User found — id: ${user._id}, emailVerified: ${user.emailVerified}, authProvider: ${user.authProvider}`);

    if (!user.password) {
      console.warn(`[AUTH] Login failed — no password set (likely Google-only account): ${normalizedEmail}`);
      logAuthEvent({ event: "login", email: normalizedEmail, userId: user._id, status: "failed", reason: "no_password_google_account" });
      throw new Error("This account uses Google sign-in. Please use 'Continue with Google'.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed — wrong password: ${normalizedEmail}`);
      logAuthEvent({ event: "login", email: normalizedEmail, userId: user._id, status: "failed", reason: "wrong_password" });
      throw new Error("Incorrect Credentials");
    }

    if (!user.emailVerified) {
      console.warn(`[AUTH] Login failed — email not verified: ${normalizedEmail}`);
      logAuthEvent({ event: "login", email: normalizedEmail, userId: user._id, status: "failed", reason: "email_not_verified" });
      throw new Error("Email not verified");
    }

    logAuthEvent({ event: "login", email: normalizedEmail, userId: user._id, status: "success" });
    console.log(`[AUTH] Login success — userId: ${user._id}, email: ${normalizedEmail}`);

    const token = genToken(user._id);
    return { user, token };
  } catch (error) {
    logError("[AUTH] loginUserService error", error, { email });
    throw error;
  }
};

export const resendOtpService = async (email, type, role) => {
  return await resendOTP(email, type, role);
};

export const verifyEmailService = async (email, otp) => {
  return verifyOTP({
    email,
    otp,
    type: OTP_TYPES.VERIFY,
    role: ROLES.USER,
    model: User,
  });
};

export const registerAdminService = async (name, email, password) => {
  try {
    console.log(`[AUTH] Admin register attempt — email: ${email}`);

    const existAdmin = await Admin.findOne({ email });
    if (existAdmin) {
      console.warn(`[AUTH] Admin register failed — already exists: ${email}`);
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

    logAuthEvent({ event: "admin_register", email, userId: admin._id, status: "success" });
    console.log(`[AUTH] Admin register success — adminId: ${admin._id}`);

    const token = await genToken1(email, admin._id.toString());
    return { admin, token };
  } catch (error) {
    logError("[AUTH] registerAdminService error", error, { email });
    throw error;
  }
};

export const verifyAdminEmailService = async (email, otp) => {
  return verifyOTP({
    email,
    otp,
    type: OTP_TYPES.VERIFY,
    role: ROLES.ADMIN,
    model: Admin,
  });
};

export const loginAdminService = async (email, password) => {
  try {
    const normalizedEmail = email.toLowerCase();
    console.log(`[AUTH] Admin login attempt — email: ${normalizedEmail}`);

    const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");
    if (!admin) {
      console.warn(`[AUTH] Admin login failed — not found in DB: ${normalizedEmail}`);
      logAuthEvent({ event: "admin_login", email: normalizedEmail, status: "failed", reason: "admin_not_found" });
      throw new Error("Admin not found");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.warn(`[AUTH] Admin login failed — wrong password: ${normalizedEmail}`);
      logAuthEvent({ event: "admin_login", email: normalizedEmail, userId: admin._id, status: "failed", reason: "wrong_password" });
      throw new Error("Invalid Credentials");
    }

    logAuthEvent({ event: "admin_login", email: normalizedEmail, userId: admin._id, status: "success" });
    console.log(`[AUTH] Admin login success — adminId: ${admin._id}`);

    const token = await genToken1(admin.email, admin._id.toString());
    return { admin, token };
  } catch (error) {
    logError("[AUTH] loginAdminService error", error, { email });
    throw error;
  }
};

export const requestPasswordResetService = async (email, role) => {
  try {
    console.log(`[AUTH] Password reset requested — email: ${email}, role: ${role}`);
    let user;

    if (role === "user") {
      user = await User.findOne({ email });
    }
    if (role === "admin") {
      user = await Admin.findOne({ email });
    }
    if (!user) {
      console.warn(`[AUTH] Password reset failed — ${role} not found: ${email}`);
      throw new Error("User not found");
    }

    await generateAndSendOTP({
      email,
      type: OTP_TYPES.RESET,
      role,
    });

    console.log(`[AUTH] Password reset OTP sent — email: ${email}`);
    return { message: "Password reset OTP sent to your email" };
  } catch (error) {
    logError("[AUTH] requestPasswordResetService error", error, { email, role });
    throw error;
  }
};

export const resetPasswordService = async (email, otp, newPassword, role) => {
  try {
    console.log(`[AUTH] Password reset attempt — email: ${email}, role: ${role}`);
    let model = Admin;
    if (role === "user") {
      model = User;
    }

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
      console.warn(`[AUTH] Password reset failed — ${role} not found: ${email}`);
      throw new Error("User not found");
    }

    console.log(`[AUTH] Password reset success — email: ${email}`);
    return { message: "Password reset successfully" };
  } catch (error) {
    logError("[AUTH] resetPasswordService error", error, { email, role });
    throw error;
  }
};

export const googleLoginService = async (name, email) => {
  try {
    console.log(`[AUTH] Google login attempt — email: ${email}`);

    let user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH] Google login — creating new user: ${email}`);
      user = await User.create({
        name,
        email,
        authProvider: "google",
      });
      logAuthEvent({ event: "google_register", email, userId: user._id, status: "success" });
    } else {
      console.log(`[AUTH] Google login — existing user found: ${email}, id: ${user._id}`);
    }

    logAuthEvent({ event: "google_login", email, userId: user._id, status: "success" });

    const token = await genToken(user._id);
    return { user, token };
  } catch (error) {
    logError("[AUTH] googleLoginService error", error, { email });
    throw error;
  }
};

export const getCurrentAdminService = async (email) => {
  try {
    const admin = await Admin.findOne({ email }).select("-password");
    if (!admin) {
      console.warn(`[AUTH] getCurrentAdmin failed — not found: ${email}`);
      throw new Error("Admin not found");
    }
    return admin;
  } catch (error) {
    logError("[AUTH] getCurrentAdminService error", error, { email });
    throw error;
  }
};

export const verifyResetOtpService = async (email, otp, role) => {
  try {
    console.log(`[AUTH] Verify reset OTP — email: ${email}, role: ${role}`);
    let model = role === "admin" ? Admin : User;
    await verifyOTP({ email, otp, type: OTP_TYPES.RESET, role, model });
    console.log(`[AUTH] Reset OTP verified — email: ${email}`);
    return { message: "OTP verified successfully" };
  } catch (error) {
    logError("[AUTH] verifyResetOtpService error", error, { email, role });
    throw error;
  }
};
