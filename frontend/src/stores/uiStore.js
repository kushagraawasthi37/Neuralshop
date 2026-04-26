import { create } from "zustand";

const initialState = {
  // Sidebar state
  sidebarOpen: false,

  // Modal states
  modals: {
    login: false,
    register: false,
    forgotPassword: false,
    addressForm: false,
    reviewForm: false,
    confirmDialog: false,
  },

  // Notification state
  notifications: [],

  // Loading states
  globalLoading: false,
  loadingStates: {},

  // UI preferences
  theme: "light",
  language: "en",

  // Search and filters
  searchQuery: "",
  activeFilters: {},
};

export const useUiStore = create((set, get) => ({
  ...initialState,

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),

  // Modal actions
  openModal: (modalName, data = null) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
      modalData: data,
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
      modalData: null,
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
      modalData: null,
    })),

  // Notification actions
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: "info",
      duration: 5000,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  // Convenience methods for notifications
  showSuccess: (message, options = {}) =>
    get().addNotification({ type: "success", message, ...options }),

  showError: (message, options = {}) =>
    get().addNotification({ type: "error", message, ...options }),

  showWarning: (message, options = {}) =>
    get().addNotification({ type: "warning", message, ...options }),

  showInfo: (message, options = {}) =>
    get().addNotification({ type: "info", message, ...options }),

  // Loading actions
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  setLoading: (key, loading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: loading },
    })),

  isLoading: (key) => get().loadingStates[key] || false,

  // Theme actions
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    })),

  // Language actions
  setLanguage: (language) => set({ language }),

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearchQuery: () => set({ searchQuery: "" }),

  // Filter actions
  setFilter: (key, value) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: value },
    })),

  removeFilter: (key) =>
    set((state) => {
      const { [key]: removed, ...rest } = state.activeFilters;
      return { activeFilters: rest };
    }),

  clearFilters: () => set({ activeFilters: {} }),

  getActiveFilters: () => get().activeFilters,

  hasActiveFilters: () => Object.keys(get().activeFilters).length > 0,

  // Getters
  isModalOpen: (modalName) => get().modals[modalName] || false,

  getModalData: () => get().modalData,

  getNotifications: () => get().notifications,

  // Reset to initial state
  reset: () => set(initialState),
}));
