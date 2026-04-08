import jwt from "jsonwebtoken";
import config from "./environment.config.js";

export const genToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiryTime,
    });
    return token;
  } catch (error) {
    console.log("Generate user token error Check file jwt.js");
  }
};

export const genToken1 = async (email, adminId) => {
  try {
    const token = jwt.sign({ email, adminId }, config.jwt.secret, {
      expiresIn: config.jwt.expiryTime,
    });
    return token;
  } catch (error) {
    console.log("Generate admin token error Check file jwt.js");
  }
};
