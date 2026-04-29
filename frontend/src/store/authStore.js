import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  pendingEmail: null,
  pendingRole: "user", // 'user' | 'admin'
  isLoggedIn: !!localStorage.getItem("token"),

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isLoggedIn: true });
  },

  setPendingEmail: (email) => set({ pendingEmail: email }),
  setPendingRole: (role) => set({ pendingRole: role }),

  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      isLoggedIn: false,
      pendingEmail: null,
      pendingRole: "user",
    });
  },
}));
