import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service.js";
import { MESSAGES } from "../constants/messages.js";

const initialState = {
  // User state
  user: null,
  isAuthenticated: false,
  userType: null, // 'user' or 'admin'

  // Loading states
  isLoading: false,
  isRefreshing: false,

  // Error state
  error: null,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);
          const { user, accessToken, refreshToken, userType } = response.data;

          // Store tokens
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }

          set({
            user,
            isAuthenticated: true,
            userType,
            isLoading: false,
            error: null,
          });

          return { success: true, message: MESSAGES.SUCCESS.LOGIN };
        } catch (error) {
          const errorMessage =
            error.userMessage || MESSAGES.ERROR.INVALID_CREDENTIALS;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(userData);

          set({ isLoading: false, error: null });

          return { success: true, message: MESSAGES.SUCCESS.REGISTER };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();

          // Clear tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set(initialState);

          return { success: true, message: MESSAGES.SUCCESS.LOGOUT };
        } catch (error) {
          // Even if logout fails, clear local state
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set(initialState);

          return { success: true, message: MESSAGES.SUCCESS.LOGOUT };
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.verifyEmail(token);

          set({ isLoading: false, error: null });

          return { success: true, message: MESSAGES.SUCCESS.EMAIL_VERIFIED };
        } catch (error) {
          const errorMessage =
            error.userMessage || MESSAGES.ERROR.INVALID_TOKEN;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          await authService.resetPassword(email);

          set({ isLoading: false, error: null });

          return { success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      updatePassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });

        try {
          await authService.updatePassword(token, newPassword);

          set({ isLoading: false, error: null });

          return { success: true, message: MESSAGES.SUCCESS.PASSWORD_CHANGED };
        } catch (error) {
          const errorMessage =
            error.userMessage || MESSAGES.ERROR.INVALID_TOKEN;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      refreshToken: async () => {
        set({ isRefreshing: true });

        try {
          const response = await authService.refreshToken();
          const { accessToken } = response.data;

          localStorage.setItem("accessToken", accessToken);

          set({ isRefreshing: false });

          return { success: true };
        } catch (error) {
          // Token refresh failed, logout user
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set({ ...initialState, isRefreshing: false });

          return { success: false };
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.updateProfile(profileData);
          const { user } = response.data;

          set({
            user: { ...get().user, ...user },
            isLoading: false,
            error: null,
          });

          return { success: true, message: MESSAGES.SUCCESS.PROFILE_UPDATED };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      // Getters
      isUser: () => get().userType === "user",
      isAdmin: () => get().userType === "admin",

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize auth state on app load
      initialize: () => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Token exists, validate it
          get().verifyToken();
        }
      },

      // Verify current token
      verifyToken: async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
          const response = await authService.verifyToken();
          const { user, userType } = response.data;

          set({
            user,
            isAuthenticated: true,
            userType,
            error: null,
          });
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set(initialState);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
      }),
    },
  ),
);
