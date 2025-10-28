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

    const token = req.token;

    return res.status(200).json({
      message: "Current user ",
      user,
      token,
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
    const adminId = req.adminId;
    console.log("Admin id :", adminId);

    const admin = await Admin.findById(adminId).select("-password");

    if (!admin) {
      console.log("Admin not found with this email");
      return res.status(403).json({ message: "Admin not found" });
    }

    const token = req.token;

    console.log("Admin Found succesfully");
    return res.status(200).json({
      message: "Current admin fetched successfully",
      admin, // sending back admin data without password
      token,
    });
  } catch (error) {
    console.error("Error in getCurrentAdmin:", error);
    return res.status(500).json({
      message: "Internal Server Error in fetching admin",
    });
  }
};
