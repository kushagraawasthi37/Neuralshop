import jwt from "jsonwebtoken";
import config from "./environment.config.js";
import { logger } from "../utils/logger.js";

// Access token — short-lived (15 min). Stored in httpOnly cookie "userToken".
export const genToken = (userId) => {
  try {
    return jwt.sign({ userId }, config.jwt.secret, { expiresIn: "15m" });
  } catch (error) {
    logger.error("Failed to generate user token", { error: error.message });
    throw error;
  }
};

// Refresh token — long-lived (7 days). Stored in httpOnly cookie "refreshToken".
// The HASH of this is stored in MongoDB; the plaintext never touches the DB.
export const genRefreshToken = (userId) => {
  try {
    return jwt.sign(
      { userId, type: "refresh" },
      config.jwt.refreshSecret ?? config.jwt.secret,
      {
        expiresIn: "7d",
      },
    );
  } catch (error) {
    logger.error("Failed to generate refresh token", { error: error.message });
    throw error;
  }
};

// Admin token — kept at 7d for admin sessions (no silent refresh needed here)
export const genToken1 = async (email, adminId) => {
  try {
    return jwt.sign({ email, adminId }, config.jwt.secret, {
      expiresIn: config.jwt.expiryTime,
    });
  } catch (error) {
    logger.error("Failed to generate admin token", { error: error.message });
    throw error;
  }
};
