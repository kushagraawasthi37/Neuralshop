import jwt from "jsonwebtoken";
import config from "./environment.config.js";
import { logger } from "../utils/logger.js";

export const genToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiryTime,
    });
    return token;
  } catch (error) {
    logger.error("Failed to generate user token", { error: error.message });
    throw error;
  }
};

export const genToken1 = async (email, adminId) => {
  try {
    const token = jwt.sign({ email, adminId }, config.jwt.secret, {
      expiresIn: config.jwt.expiryTime,
    });
    return token;
  } catch (error) {
    logger.error("Failed to generate admin token", { error: error.message });
    throw error;
  }
};
