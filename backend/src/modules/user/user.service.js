import { User } from "./user.model.js";
import prisma from "../../prisma/client.js";
import { deleteCache } from "../../utils/cache.js";

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

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

export const getUserProfileService = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "-password -resetToken -resetTokenExpiry",
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfileService = async (userId, updateData) => {
  try {
    const allowedFields = ["name", "phone", "profilePicture"];
    const filteredData = {};

    // Only allow specific fields to be updated
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    }).select("-password -resetToken -resetTokenExpiry");

    if (!user) {
      throw new Error("User not found");
    }

    await deleteCache(`user:${userId}`);

    return user;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADDRESS MANAGEMENT
// ============================================

export const getUserAddressesService = async (userId) => {
  try {
    // console.log(prisma);
    // console.log(prisma.address);
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" }, // Default addresses first
        { createdAt: "desc" },
      ],
    });
    return addresses;
  } catch (error) {
    throw error;
  }
};

export const createUserAddressService = async (userId, addressData) => {
  try {
    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...addressData,
        userId,
      },
    });

    return address;
  } catch (error) {
    throw error;
  }
};

export const updateUserAddressService = async (
  userId,
  addressId,
  updateData,
) => {
  try {
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });

    return address;
  } catch (error) {
    throw error;
  }
};

export const deleteUserAddressService = async (userId, addressId) => {
  try {
    // Check if address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { message: "Address deleted successfully" };
  } catch (error) {
    throw error;
  }
};

export const getUserDefaultAddressService = async (userId) => {
  try {
    const address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    return address;
  } catch (error) {
    throw error;
  }
};
