import jwt from "jsonwebtoken";


const isAdmin = async (req, res, next) => {
  try {
    const email = req.email;
    const admin = await user.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Not a admin" });
    }
    req.adminId = admin._id;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unauthorized access ${error.message}` });
  }
};

export default isAdmin;
