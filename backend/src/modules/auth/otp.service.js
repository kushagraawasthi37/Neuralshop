// src/modules/auth/otp.service.js

import redisClient from "../../config/redis.js";
import crypto from "crypto";
import { produceMailEvent } from "../../events/producers/mail.producer.js";
import { mailEvents } from "../../events/event-types.js";

const OTP_EXPIRY = 10 * 60;

export const OTP_TYPES = {
  VERIFY: "verification",
  RESET: "reset",
};

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const normalizeEmail = (email) => email?.trim().toLowerCase();

const getKey = (prefix, type, role, email) =>
  `${prefix}:${type}:${role}:${email}`;

const incrementCounter = async (key) => {
  await redisClient.incr(key);
  await redisClient.expire(key, 3600);
};

// GENERATE + SEND OTP
export const generateAndSendOTP = async ({ email, type, role }) => {
  const normalizedEmail = normalizeEmail(email);
  const reqKey = getKey("otp_requests", type, role, normalizedEmail);
  const count = parseInt((await redisClient.get(reqKey)) || 0);

  if (count >= 5) {
    throw new Error("Too many OTP requests. Try later.");
  }

  const otp = generateOTP();
  const otpKey = getKey("otp", type, role, normalizedEmail);

  await redisClient.set(otpKey, otp, "EX", OTP_EXPIRY);
  await incrementCounter(reqKey);

  const eventType =
    type === OTP_TYPES.RESET
      ? mailEvents.PASSWORD_RESET
      : mailEvents.EMAIL_VERIFICATION;

  await produceMailEvent(eventType, { email: normalizedEmail, otp });
};

// VERIFY OTP

export const verifyOTP = async ({ email, otp, type, role, model }) => {
  const normalizedEmail = normalizeEmail(email);
  const attemptsKey = getKey("otp_attempts", type, role, normalizedEmail);
  const attempts = parseInt((await redisClient.get(attemptsKey)) || 0);

  if (attempts >= 5) {
    throw new Error("Too many attempts");
  }

  const otpKey = getKey("otp", type, role, normalizedEmail);
  const stored = await redisClient.get(otpKey);

  if (!stored || stored !== otp) {
    await incrementCounter(attemptsKey);
    throw new Error("Invalid OTP");
  }

  const user = await model.findOneAndUpdate(
    { email: normalizedEmail },
    { emailVerified: true },
    { new: true },
  );

  if (!user) throw new Error("User not found");

  await redisClient.del(otpKey);

  return { message: "Verified successfully" };
};

// RESEND OTP
export const resendOTP = async (email, type, role) => {
  return generateAndSendOTP({ email, type, role });
};
