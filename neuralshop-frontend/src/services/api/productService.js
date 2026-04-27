import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api", // change if needed
  withCredentials: true,
});

// productService.js
export const productService = {
  getTrending: () => API.get("/recommendations/trending?limit=8"),
  getTopRated: () => API.get("/recommendations/top-rated?limit=8"),
  getById: (id) => API.get(`/product/${id}`),
};
