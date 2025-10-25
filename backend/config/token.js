import jwt from "jsonwebtoken";

export const genToken = async (userId) => {
  try {
    let token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY_TIME,
    });
    return token;
  } catch (error) {
    console.log("Generate user token error Check file token.js");
  }
};
export const genToken1 = async (email) => {
  try {
    let token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY_TIME,
    });
    return token;
  } catch (error) {
    console.log("Generate admin token error Check file token.js");
  }
};
