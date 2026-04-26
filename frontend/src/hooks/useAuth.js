import { useAuthStore } from "../stores/authStore.js";
import { useEffect } from "react";

/**
 * Custom hook for authentication management
 * Provides access to auth state and actions
 */
export const useAuth = () => {
  const {
    // State
    user,
    isAuthenticated,
    userType,
    isLoading,
    isRefreshing,
    error,

    // Actions
    login,
    register,
    logout,
    verifyEmail,
    resetPassword,
    updatePassword,
    refreshToken,
    updateProfile,
    verifyToken,
    clearError,
    initialize,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Computed values
  const isUser = userType === "user";
  const isAdmin = userType === "admin";

  return {
    // State
    user,
    isAuthenticated,
    userType,
    isUser,
    isAdmin,
    isLoading,
    isRefreshing,
    error,

    // Actions
    login,
    register,
    logout,
    verifyEmail,
    resetPassword,
    updatePassword,
    refreshToken,
    updateProfile,
    verifyToken,
    clearError,

    // Utilities
    hasRole: (role) => userType === role,
    isGuest: () => !isAuthenticated,
  };
};
