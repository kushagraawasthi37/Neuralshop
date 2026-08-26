import { create } from "zustand";

const getRawToken = () => localStorage.getItem("token");
const isTokenValid = (t) => !!t && t !== "undefined" && t !== "null";


//Set is the zustand function to update the store state
export const useAuthStore = create((set) => ({
  user: null,
  token: isTokenValid(getRawToken()) ? getRawToken() : null,
  role: localStorage.getItem("userRole") || "user",
  pendingEmail: null,
  pendingRole: "user",
  isLoggedIn: isTokenValid(getRawToken()),
  isInitializing: true,

  setAuth: (user, token, role = "user") => {
    if (!isTokenValid(token)) return;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    set({ user, token, isLoggedIn: true, role, isInitializing: false });
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
      isInitializing: false,
    });
  },
}));
