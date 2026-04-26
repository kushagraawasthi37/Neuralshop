import { useCartStore } from "../stores/cartStore.js";
import { useAuth } from "./useAuth.js";
import { useEffect } from "react";

/**
 * Custom hook for cart management
 * Automatically handles guest vs authenticated cart
 */
export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const {
    // State
    items,
    total,
    itemCount,
    isLoading,
    error,
    guestSessionId,

    // Actions
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    initGuestCart,
    migrateGuestCart,
    optimisticAddItem,
    clearError,

    // Getters
    getItemById,
    getItemQuantity,
    isInCart,
    getFormattedTotal,
    isEmpty,
  } = useCartStore();

  // Initialize cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      // Authenticated user - fetch their cart
      fetchCart();
    } else if (!guestSessionId) {
      // Guest user - initialize guest cart
      initGuestCart();
    }
  }, [isAuthenticated, guestSessionId, fetchCart, initGuestCart]);

  // Migrate guest cart when user logs in
  useEffect(() => {
    if (isAuthenticated && guestSessionId) {
      migrateGuestCart();
    }
  }, [isAuthenticated, guestSessionId, migrateGuestCart]);

  return {
    // State
    items,
    total,
    itemCount,
    isLoading,
    error,

    // Actions
    addItem,
    updateItem,
    removeItem,
    clearCart,
    fetchCart,
    clearError,

    // Optimistic updates
    optimisticAddItem,

    // Getters
    getItemById,
    getItemQuantity,
    isInCart,
    getFormattedTotal,
    isEmpty,

    // Computed
    hasItems: itemCount > 0,
    isGuestCart: !isAuthenticated && !!guestSessionId,
  };
};
