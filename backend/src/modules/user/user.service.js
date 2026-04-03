<<<<<<< HEAD
import { User } from "./user.model.js";
=======
import User from "./user.model.js";
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567

export const getCurrentUserService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserByIdService = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw error;
  }
};
