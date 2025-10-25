import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // console.log("Cookies received:", req.cookies);
    // console.log("Token:", req.cookies?.token);

    const token = req.cookies?.token;

    if (!token) {
      return res.status(400).json({ message: "user does not have token" });
    }
    try {
      // console.log("Verifying token:", token);
      let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", verifyToken);
      req.userId = verifyToken.userId;
      next();
    } catch (error) {
      // console.log("JWT error:", error.message);
      return res.status(500).json({ message: `isAuth error ${error.message}` });
    }
  } catch (error) {
    // console.log("isAuth error");
    return res.status(500).json({ message: `isAuth error ${error}` });
  }
};

export default isAuth;
