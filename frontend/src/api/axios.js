import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/",
  withCredentials: true,
  timeout: 15000,
});

//Interceptor before sending the request to backend this code is excecuted
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];


//It is used to process the waiting request after the token is refreshed
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


//Response interceptor will run after the response is recieved
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {

      //Some request is already trying to refresh the token
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data?.data?.token || data?.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          //Interceptor before sending the request to backend this code is excecuted
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default api;

// API Request
//      ↓
// Access Token
//      ↓
// Backend
//      ↓
//        200 ─────────→ Return response
//      │
//     401
//      ↓
// Is refresh already running?
//      │
//  ┌───┴────┐
//  No       Yes
//  ↓         ↓
// Refresh   Queue request
//  ↓         ↓
// New Token  Wait
//  ↓         ↓
// Retry ←────┘