import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/registration", data),
  login: (data) => api.post("/auth/login", data),
  logout: (role = "user") =>
    api.get(role === "admin" ? "/auth/admin/logout" : "/auth/user/logout"),
  adminRegister: (data) => api.post("/auth/adminregister", data),
  adminLogin: (data) => api.post("/auth/adminlogin", data),
  adminLogout: () => api.get("/auth/admin/logout"),
  verifyEmail: (data) => api.post("/auth/verify-email", data),
  resendOtp: (data) => api.post("/auth/resend-otp", data),
  forgotPassword: (data) => api.post("/auth/request-password-reset", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  verifyResetOtp: (data) => api.post("/auth/verify-reset-otp", data),
  googleLogin: (data) => api.post("/auth/googlelogin", data),
};
