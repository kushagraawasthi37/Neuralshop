import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// attach token
api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();
  const token = state.token;
  console.log(
    "🔑 Axios Interceptor - Token:",
    token ? "Present" : "Missing",
    "Role:",
    state.role,
    "URL:",
    config.url,
  );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header set for:", config.url);
  } else {
    console.log("❌ No token available for:", config.url);
  }
  return config;
});

export default api;
