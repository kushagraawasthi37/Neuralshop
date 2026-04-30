import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("userRole") || "user", // "user" | "admin"
  pendingEmail: null,
  pendingRole: "user",
  isLoggedIn: !!localStorage.getItem("token"),

  // role param: "user" (default) or "admin"
  setAuth: (user, token, role = "user") => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    set({ user, token, isLoggedIn: true, role });
  },

  setPendingEmail: (email) => set({ pendingEmail: email }),
  setPendingRole: (role) => set({ pendingRole: role }),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    set({
      user: null,
      token: null,
      isLoggedIn: false,
      role: "user",
      pendingEmail: null,
      pendingRole: "user",
    });
  },
}));
