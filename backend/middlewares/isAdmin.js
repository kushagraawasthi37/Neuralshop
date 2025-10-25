import jwt from "jsonwebtoken";
import Admin from "../model/admin.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const { email } = req.email;
    const admin = Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Not a admin" });
    }
    next();
  } catch (error) {
    console.log("Only authorized by admin", error);
    return res
      .status(500)
      .json({ message: `Unauthorized access ${error.message}` });
  }
};

export default isAdmin;
