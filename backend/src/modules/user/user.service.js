import { User } from "./user.model.js";
import prisma from "../../prisma/client.js";
import { deleteCache } from "../../utils/cache.js";

export const getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getUserByIdService = async (userId) => {
  return User.findById(userId);
};

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -resetToken -resetTokenExpiry",
  );
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateUserProfileService = async (userId, updateData) => {
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
};

// ============================================
// ADDRESS MANAGEMENT
// ============================================

export const getUserAddressesService = async (userId) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" }, // Default addresses first
      { createdAt: "desc" },
    ],
  });
  return addresses;
};

export const createUserAddressService = async (userId, addressData) => {
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
};

export const updateUserAddressService = async (
  userId,
  addressId,
  updateData,
) => {
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
};

export const deleteUserAddressService = async (userId, addressId) => {
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
};

export const getUserDefaultAddressService = async (userId) => {
  const address = await prisma.address.findFirst({
    where: { userId, isDefault: true },
  });
  return address;
};
