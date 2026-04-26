import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "../services/cart.service.js";
import { MESSAGES } from "../constants/messages.js";
import { formatPrice } from "../utils/formatters.js";

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
  guestSessionId: null,
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      fetchCart: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await cartService.getCart();
          const { items, total, itemCount } = response.data;

          set({
            items: items || [],
            total: total || 0,
            itemCount: itemCount || 0,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      addItem: async (productId, quantity = 1, size = null) => {
        set({ isLoading: true, error: null });

        try {
          const response = await cartService.addItem({
            productId,
            quantity,
            size,
          });
          const { items, total, itemCount } = response.data;

          set({
            items: items || [],
            total: total || 0,
            itemCount: itemCount || 0,
            isLoading: false,
            error: null,
          });

          return {
            success: true,
            message: MESSAGES.SUCCESS.PRODUCT_ADDED_TO_CART,
          };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      updateItem: async (itemId, quantity) => {
        set({ isLoading: true, error: null });

        try {
          const response = await cartService.updateItem(itemId, { quantity });
          const { items, total, itemCount } = response.data;

          set({
            items: items || [],
            total: total || 0,
            itemCount: itemCount || 0,
            isLoading: false,
            error: null,
          });

          return { success: true, message: MESSAGES.SUCCESS.CART_UPDATED };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await cartService.removeItem(itemId);
          const { items, total, itemCount } = response.data;

          set({
            items: items || [],
            total: total || 0,
            itemCount: itemCount || 0,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });

        try {
          await cartService.clearCart();

          set({
            ...initialState,
            guestSessionId: get().guestSessionId, // Preserve guest session
          });

          return { success: true, message: MESSAGES.SUCCESS.CART_CLEARED };
        } catch (error) {
          const errorMessage = error.userMessage || MESSAGES.ERROR.GENERIC;

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      // Guest cart management
      initGuestCart: async () => {
        try {
          const response = await cartService.initGuestCart();
          const { sessionId } = response.data;

          set({ guestSessionId: sessionId });

          return { success: true, sessionId };
        } catch (error) {
          return {
            success: false,
            message: error.userMessage || MESSAGES.ERROR.GENERIC,
          };
        }
      },

      migrateGuestCart: async () => {
        if (!get().guestSessionId) return { success: true };

        try {
          await cartService.migrateGuestCart(get().guestSessionId);

          // Refresh cart after migration
          await get().fetchCart();

          set({ guestSessionId: null });

          return { success: true, message: MESSAGES.INFO.CART_MIGRATED };
        } catch (error) {
          return {
            success: false,
            message: error.userMessage || MESSAGES.ERROR.GENERIC,
          };
        }
      },

      // Getters
      getItemById: (itemId) => {
        return get().items.find((item) => item.id === itemId);
      },

      getItemQuantity: (productId, size = null) => {
        const item = get().items.find(
          (item) =>
            item.productId === productId &&
            (size === null || item.size === size),
        );
        return item ? item.quantity : 0;
      },

      isInCart: (productId, size = null) => {
        return get().items.some(
          (item) =>
            item.productId === productId &&
            (size === null || item.size === size),
        );
      },

      getFormattedTotal: () => {
        return formatPrice(get().total);
      },

      isEmpty: () => {
        return get().itemCount === 0;
      },

      // Optimistic updates for better UX
      optimisticAddItem: (product, quantity = 1, size = null) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.productId === product.id &&
            (size === null || item.size === size),
        );

        let newItems;
        let newTotal = get().total;
        let newItemCount = get().itemCount;

        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = [...currentItems];
          const existingItem = newItems[existingItemIndex];
          const oldQuantity = existingItem.quantity;
          existingItem.quantity += quantity;

          newTotal += product.price * quantity;
          newItemCount += quantity;
        } else {
          // Add new item
          const newItem = {
            id: `temp_${Date.now()}`,
            productId: product.id,
            product,
            quantity,
            size,
            price: product.price,
            total: product.price * quantity,
          };

          newItems = [...currentItems, newItem];
          newTotal += newItem.total;
          newItemCount += quantity;
        }

        set({
          items: newItems,
          total: newTotal,
          itemCount: newItemCount,
        });

        // Return cleanup function
        return () => {
          // This will be called if the API call fails
          set({
            items: currentItems,
            total: get().total - product.price * quantity,
            itemCount: get().itemCount - quantity,
          });
        };
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        guestSessionId: state.guestSessionId,
      }),
    },
  ),
);
