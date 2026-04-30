import { getCurrentUserService } from "./user.service.js";
import {
  getUserProfileService,
  updateUserProfileService,
  getUserAddressesService,
  createUserAddressService,
  updateUserAddressService,
  deleteUserAddressService,
  getUserDefaultAddressService,
} from "./user.service.js";
import ApiResponse from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getCurrentUserService(req.userId);
  const token = req.token;

  return res.status(200).json({
    user,
    token,
  });
});

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfileService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, profilePicture } = req.body;

  const user = await updateUserProfileService(req.userId, {
    name,
    phone,
    profilePicture,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// ============================================
// ADDRESS MANAGEMENT
// ============================================

export const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await getUserAddressesService(req.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

export const createUserAddress = async (req, res) => {
  try {
    const { label, street, city, state, zipCode, country, phone, isDefault } =
      req.body;

    const address = await createUserAddressService(req.userId, {
      label,
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: isDefault || false,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, address, "Address created successfully"));
  } catch (error) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, error.message || "Failed to create address"),
      );
  }
};

export const updateUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, street, city, state, zipCode, country, phone, isDefault } =
      req.body;

    const address = await updateUserAddressService(req.userId, addressId, {
      label,
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, address, "Address updated successfully"));
  } catch (error) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, error.message || "Failed to update address"),
      );
  }
};

export const deleteUserAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const result = await deleteUserAddressService(req.userId, addressId);

    return res.status(200).json(new ApiResponse(200, null, result.message));
  } catch (error) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, error.message || "Failed to delete address"),
      );
  }
};

export const getUserDefaultAddress = async (req, res) => {
  try {
    const address = await getUserDefaultAddressService(req.userId);

    if (!address) {
      return res
        .status(200)
        .json(new ApiResponse(200, address, "No default address set"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, address, "Default address fetched successfully"),
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          error.message || "Failed to fetch default address",
        ),
      );
  }
};
