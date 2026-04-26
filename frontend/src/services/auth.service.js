import { apiMethods } from "./api.js";
import { API_ENDPOINTS } from "../constants/api.js";

export const authService = {
  // User authentication
  login: async (credentials) => {
    return apiMethods.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  register: async (userData) => {
    return apiMethods.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  logout: async () => {
    return apiMethods.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  verifyEmail: async (token) => {
    return apiMethods.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  resendOTP: async (email) => {
    return apiMethods.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
  },

  resetPassword: async (email) => {
    return apiMethods.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  updatePassword: async (token, newPassword) => {
    return apiMethods.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password: newPassword,
    });
  },

  refreshToken: async () => {
    return apiMethods.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
  },

  verifyToken: async () => {
    return apiMethods.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
  },

  // Profile management
  getProfile: async () => {
    return apiMethods.get(API_ENDPOINTS.USER.PROFILE);
  },

  updateProfile: async (profileData) => {
    return apiMethods.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
  },

  // Address management
  getAddresses: async () => {
    return apiMethods.get(API_ENDPOINTS.USER.ADDRESSES);
  },

  addAddress: async (addressData) => {
    return apiMethods.post(API_ENDPOINTS.USER.ADDRESSES, addressData);
  },

  updateAddress: async (addressId, addressData) => {
    return apiMethods.put(API_ENDPOINTS.USER.ADDRESS(addressId), addressData);
  },

  deleteAddress: async (addressId) => {
    return apiMethods.delete(API_ENDPOINTS.USER.ADDRESS(addressId));
  },
};
