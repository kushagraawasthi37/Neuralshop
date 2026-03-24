import { getCurrentUserService } from "./user.service.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getCurrentUserService(req.userId);
    const token = req.token;

    return res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong.Login again",
    });
  }
};
