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

const getKey = (prefix, type, role, email) =>
  `${prefix}:${type}:${role}:${email}`;

// GENERATE + SEND OTP
export const generateAndSendOTP = async ({ email, type, role }) => {
  const reqKey = getKey("otp_requests", type, role, email);
  const count = parseInt((await redisClient.get(reqKey)) || 0);

  if (count >= 5) {
    throw new Error("Too many OTP requests. Try later.");
  }

  const otp = generateOTP();
  const otpKey = getKey("otp", type, role, email);

  await redisClient.set(otpKey, otp, "EX", OTP_EXPIRY);

  await redisClient.incr(reqKey);
  await redisClient.expire(reqKey, 3600);

  const eventType =
    type === OTP_TYPES.RESET
      ? mailEvents.PASSWORD_RESET
      : mailEvents.EMAIL_VERIFICATION;

  await produceMailEvent(eventType, { email, otp });
};

// VERIFY OTP

export const verifyOTP = async ({ email, otp, type, role, model }) => {
  const attemptsKey = getKey("otp_attempts", type, role, email);
  const attempts = parseInt((await redisClient.get(attemptsKey)) || 0);

  if (attempts >= 5) {
    throw new Error("Too many attempts");
  }

  const otpKey = getKey("otp", type, role, email);
  const stored = await redisClient.get(otpKey);

  if (!stored || stored !== otp) {
    await redisClient.incr(attemptsKey);
    await redisClient.expire(attemptsKey, 3600);
    throw new Error("Invalid OTP");
  }

  const user = await model.findOneAndUpdate(
    { email },
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
