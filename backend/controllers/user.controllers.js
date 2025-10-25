import User from "../model/user.model.js";
export const getCurrentUser = async (req,res) => {
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
