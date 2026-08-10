import jwt from "jsonwebtoken";
import config from "../config/environment.config.js";
import redisClient from "../config/redis.js";

// ─── isAuth — user routes ─────────────────────────────────────────────────
// Returns 401 (not 400) so the frontend Axios interceptor knows to trigger
// a silent refresh via POST /api/auth/refresh.
const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.userToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1].trim() : null);

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    try {
      const blacklisted = await redisClient.get(`blacklisted_token:${token}`);
      if (blacklisted) {
        return res.status(401).json({ success: false, message: "Session invalidated. Please log in again." });
      }
    } catch {
      return res.status(503).json({ success: false, message: "Auth service temporarily unavailable." });
    }

    try {
      const payload = jwt.verify(token, config.jwt.secret);
      req.userId = payload.userId;
      req.token = token;
      next();
    } catch (jwtErr) {
      // Distinguish expired vs invalid so the frontend can decide to refresh
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired", code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal auth error" });
  }
};

// ─── isAuthAdmin — admin routes ──────────────────────────────────────────
const isAuthAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.adminToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1].trim() : null);

    if (!token) {
      return res.status(401).json({ success: false, message: "Admin authentication required" });
    }

    try {
      const blacklisted = await redisClient.get(`blacklisted_token:${token}`);
      if (blacklisted) {
        return res.status(401).json({ success: false, message: "Session invalidated. Please log in again." });
      }
    } catch {
      return res.status(503).json({ success: false, message: "Auth service temporarily unavailable." });
    }

    try {
      const payload = jwt.verify(token, config.jwt.secret);
      req.email = payload.email;
      req.adminId = payload.adminId;
      req.token = token;
      next();
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired", code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal auth error" });
  }
};

export { isAuthAdmin };
export default isAuth;
