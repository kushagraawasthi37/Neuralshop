import { create } from "zustand";
import { authService } from "../services/api/authService";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  role: null, // 'user' or 'admin'

  // Helper methods
  setToken: (token) => set({ token }),
  setRole: (role) => set({ role }),

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(data);
      return res.data;
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data); // 👈 IMPORTANT
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(data);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        role: "user",
      });
      return res.data;
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data); // 👈 IMPORTANT
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  adminLogin: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.adminLogin(data);
      console.log("🔑 Admin Login Response:", res.data);
      set({
        user: res.data.admin,
        token: res.data.token,
        isAuthenticated: true,
        role: "admin",
      });
      console.log(
        "🔑 Admin Login Store Updated - Token:",
        res.data.token ? "Set" : "Not Set",
      );
      return res.data;
    } catch (error) {
      console.log("ADMIN LOGIN ERROR:", error.response?.data); // 👈 IMPORTANT
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
    });
  },
}));
