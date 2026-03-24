import jwt from "jsonwebtoken";
import config from "../config/environment.config.js";

const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1].trim()
        : null);

    if (!token) {
      return res.status(400).json({ message: "user does not have token" });
    }

    try {
      const verifyToken = jwt.verify(token, config.jwt.secret);
      req.userId = verifyToken?.userId;
      req.email = verifyToken?.email;
      req.token = token;
      next();
    } catch (error) {
      console.log("JWT error:", error.message);
      return res.status(500).json({ message: `isAuth error ${error.message}` });
    }
  } catch (error) {
    console.log("isAuth error");
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};

export default isAuth;
