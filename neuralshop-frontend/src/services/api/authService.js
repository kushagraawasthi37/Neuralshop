import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api", // confirm port
  withCredentials: true,
});

export const authService = {
  register: (data) => API.post("/auth/registration", data),
  login: (data) => API.post("/auth/login", data),
  verifyEmail: (data) => API.post("/auth/verify-email", data),
  forgotPassword: (data) => API.post("/auth/request-password-reset", data),
  resetPassword: (data) => API.post("/auth/reset-password", data),
  resendOtp: (data) => API.post("/auth/resend-otp", data),
  logout: () => API.get("/auth/user/logout"),
  adminLogout: () => API.get("/auth/admin/logout"),

  adminRegister: (data) => API.post("/auth/adminregister", data),
  adminLogin: (data) => API.post("/auth/adminlogin", data),
  verifyAdminEmail: (data) => API.post("/auth/verify-admin-email", data),
};
