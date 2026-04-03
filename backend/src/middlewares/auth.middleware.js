import jwt from "jsonwebtoken";
import config from "../config/environment.config.js";
<<<<<<< HEAD
import redisClient from "../config/redis.js";

//User
=======

>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
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

<<<<<<< HEAD
    // blacklist lookup
    const blacklisted = await redisClient.get(`blacklisted_token:${token}`);
    if (blacklisted) {
      return res
        .status(401)
        .json({ message: "Token invalidated. Please login again." });
    }

    try {
      const verifyToken = jwt.verify(token, config.jwt.secret);
      req.userId = verifyToken?.userId;
      req.token = token;
      next();
    } catch (error) {
      console.log("JWT error:", error.message);
      return res.status(401).json({ message: `isAuth error ${error.message}` });
    }
  } catch (error) {
    console.log("isAuth error", error);
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};

const isAuthAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1].trim()
        : null);

    if (!token) {
      return res.status(400).json({ message: "admin does not have token" });
    }

    // blacklist lookup
    const blacklisted = await redisClient.get(`blacklisted_token:${token}`);
    if (blacklisted) {
      return res
        .status(401)
        .json({ message: "Token invalidated. Please login again." });
    }

    try {
      const verifyToken = jwt.verify(token, config.jwt.secret);
=======
    try {
      const verifyToken = jwt.verify(token, config.jwt.secret);
      req.userId = verifyToken?.userId;
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
      req.email = verifyToken?.email;
      req.token = token;
      next();
    } catch (error) {
      console.log("JWT error:", error.message);
<<<<<<< HEAD
      return res
        .status(401)
        .json({ message: `isAuthAdmin error ${error.message}` });
    }
  } catch (error) {
    console.log("isAuthAdmin error", error);
    return res.status(500).json({ message: `isAuthAdmin error ${error}` });
  }
};

export { isAuthAdmin };
=======
      return res.status(500).json({ message: `isAuth error ${error.message}` });
    }
  } catch (error) {
    console.log("isAuth error");
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};

>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
export default isAuth;
