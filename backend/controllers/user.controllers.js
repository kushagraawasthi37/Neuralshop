import Admin from "../model/admin.model.js";
import User from "../model/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(403).json({
        message: "user not found ",
      });
    }

    return res.status(200).json({
      message: "Current user ",
      user,
    });
  } catch (error) {
    console.log("Something went wrong..user not found ", error);
    return res.status(500).json({
      message: "Something went wrong..user not found ",
    });
  }
};

export const getCurrentAdmin = async (req, res) => {
  try {
    // Email should be extracted from req.user/email set by auth middleware
    const email = req.email || (req.user && req.user.email);
    if (!email) {
      return res.status(401).json({ message: "Unauthorized: email missing" });
    }

    const admin = await Admin.findOne({ email }).select("-password");

    if (!admin) {
      return res.status(403).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Current admin fetched successfully",
      admin, // sending back admin data without password
    });
  } catch (error) {
    console.error("Error in getCurrentAdmin:", error);
    return res.status(500).json({
      message: "Internal Server Error in fetching admin",
    });
  }
};
