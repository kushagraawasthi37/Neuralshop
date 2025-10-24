import jwt from "jsonwebtoken";

export const genToken = async (userId) => {
  try {
    let token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY_TIME,
    });
    return token;
  } catch (error) {
    console.log("Generate token error Check file token.js");
  }
};
