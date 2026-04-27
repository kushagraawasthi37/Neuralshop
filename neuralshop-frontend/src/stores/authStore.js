import { create } from "zustand";
import { authService } from "../services/api/authService";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

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
      });
      return res.data;
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data); // 👈 IMPORTANT
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
    });
  },
}));
