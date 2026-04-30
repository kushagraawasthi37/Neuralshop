import jwt from "jsonwebtoken";
import config from "../config/environment.config.js";
import redisClient from "../config/redis.js";

//User
const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.userToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1].trim()
        : null);

    if (!token) {
      return res.status(400).json({ message: "user does not have token" });
    }

    // blacklist lookup — skip gracefully if Redis is unavailable
    try {
      const blacklisted = await redisClient.get(`blacklisted_token:${token}`);
      if (blacklisted) {
        return res
          .status(401)
          .json({ message: "Token invalidated. Please login again." });
      }
    } catch (_redisErr) {
      // Redis unavailable — proceed without blacklist check
    }

    try {
      const verifyToken = jwt.verify(token, config.jwt.secret);
      req.userId = verifyToken?.userId;
      req.token = token;
      next();
    } catch (error) {
      return res.status(401).json({ message: `isAuth error ${error.message}` });
    }
  } catch (error) {
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};

const isAuthAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1].trim()
        : null) || req.cookies?.adminToken;

    if (!token) {
      return res.status(400).json({ message: "Admin authentication required" });
    }

    // blacklist lookup — skip gracefully if Redis is unavailable
    try {
      const blacklisted = await redisClient.get(`blacklisted_token:${token}`);
      if (blacklisted) {
        return res
          .status(401)
          .json({ message: "Token invalidated. Please login again." });
      }
    } catch (_redisErr) {
      // Redis unavailable — proceed without blacklist check
    }

    try {
      const verifyToken = jwt.verify(token, config.jwt.secret);
      req.email = verifyToken?.email;
      req.adminId = verifyToken?.adminId;
      req.token = token;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: `isAuthAdmin error ${error.message}` });
    }
  } catch (error) {
    return res.status(500).json({ message: `isAuthAdmin error ${error}` });
  }
};

export { isAuthAdmin };
export default isAuth;
