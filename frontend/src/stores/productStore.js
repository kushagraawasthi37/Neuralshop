import { create } from "zustand";
import { apiMethods } from "../services/api.js";
import { API_ENDPOINTS } from "../constants/api.js";

const initialState = {
  products: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
};

export const useProductStore = create((set, get) => ({
  ...initialState,

  // Actions
  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiMethods.get(
        `${API_ENDPOINTS.PRODUCT.LIST}?bestseller=true&limit=8`,
      );
      const products = response.data.products || [];

      set({
        featuredProducts: products,
        isLoading: false,
        error: null,
      });

      return products;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch products";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `${API_ENDPOINTS.PRODUCT.LIST}?${queryString}`
        : API_ENDPOINTS.PRODUCT.LIST;

      const response = await apiMethods.get(url);
      const products = response.data.products || [];

      set({
        products,
        isLoading: false,
        error: null,
      });

      return products;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch products";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiMethods.get(API_ENDPOINTS.PRODUCT.DETAIL(id));
      const product = response.data.product;

      set({
        isLoading: false,
        error: null,
      });

      return product;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch product";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
