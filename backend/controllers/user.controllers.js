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
    console.log(req.email);
    const admin = await Admin.findOne({ email: req.email }).select("-password");

    if (!admin) {
      return res.status(403).json({
        message: "admin not found ",
      });
    }

    return res.status(200).json({
      message: "current admin",
      admin,
    });
  } catch (error) {
    console.log("Something went wrong. Admin not found ", error);
    return res.status(500).json({
      message: "Something went wrong. Admin not found ",
    });
  }
};
