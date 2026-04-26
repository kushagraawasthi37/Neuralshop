import { create } from "zustand";

const initialState = {
  toasts: [],
};

export const useNotificationStore = create((set, get) => ({
  ...initialState,

  // Add toast
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      position: "top-right",
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  // Remove toast
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  // Clear all toasts
  clearToasts: () => set({ toasts: [] }),

  // Convenience methods
  success: (message, options = {}) =>
    get().addToast({
      type: "success",
      message,
      ...options,
    }),

  error: (message, options = {}) =>
    get().addToast({
      type: "error",
      message,
      ...options,
    }),

  warning: (message, options = {}) =>
    get().addToast({
      type: "warning",
      message,
      ...options,
    }),

  info: (message, options = {}) =>
    get().addToast({
      type: "info",
      message,
      ...options,
    }),

  // Getters
  getToasts: () => get().toasts,

  getToastsByType: (type) =>
    get().toasts.filter((toast) => toast.type === type),

  getToastsByPosition: (position) =>
    get().toasts.filter((toast) => toast.position === position),

  // Update toast
  updateToast: (id, updates) =>
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast,
      ),
    })),

  // Reset
  reset: () => set(initialState),
}));
