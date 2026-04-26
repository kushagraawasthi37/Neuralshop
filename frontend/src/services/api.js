import axios from "axios";
import { API_ENDPOINTS, REQUEST_TIMEOUT } from "../constants/api.js";
import { handleApiError, isAuthError } from "../utils/error-handler.js";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: REQUEST_TIMEOUT,
  withCredentials: true, // For cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token and idempotency key
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add idempotency key for POST/PUT/PATCH requests
    if (["post", "put", "patch"].includes(config.method?.toLowerCase())) {
      const idempotencyKey = generateIdempotencyKey();
      config.headers["Idempotency-Key"] = idempotencyKey;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (isAuthError(error) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await api.post(
          API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        );

        if (refreshResponse.data?.accessToken) {
          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem("accessToken", newToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = handleApiError(error);
    error.userMessage = errorMessage;

    return Promise.reject(error);
  },
);

// Generate idempotency key for requests
const generateIdempotencyKey = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// API methods wrapper
export const apiMethods = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;
