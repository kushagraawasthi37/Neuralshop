import api from "../axios";

// productService.js
export const productService = {
  // Public endpoints
  getTrending: () => api.get("/recommendations/trending?limit=8"),
  getTopRated: () => api.get("/recommendations/top-rated?limit=8"),
  getById: (id) => api.get(`/product/${id}`),
  listProducts: (params) => api.get("/product/list", { params }),
  addProduct: (formData) =>
    api.post("/product/addproduct", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Admin endpoints
  getAdminProducts: async () => {
    console.log("🔑 Making getAdminProducts request");
    const res = await api.get("/product/admin/list");
    console.log("🔑 getAdminProducts response:", res.status, res.data);

    // If response includes a token, update the auth store
    if (res.data.token) {
      console.log("🔑 Found token in response, updating auth store");
      const { useAuthStore } = await import("../../stores/authStore");
      const store = useAuthStore.getState();
      store.setToken(res.data.token);
      store.setRole("admin");
      console.log("🔑 Auth store updated with token from response");
    }

    return res.data; // 🔥 only return actual data
  },
  
  updateProduct: async (id, formData) => {
    console.log("🔑 Making updateProduct request for ID:", id);
    const res = await api.put(`/product/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // If response includes a token, update the auth store
    if (res.data?.token) {
      console.log("🔑 Found token in update response, updating auth store");
      const { useAuthStore } = await import("../../stores/authStore");
      const store = useAuthStore.getState();
      store.setToken(res.data.token);
      store.setRole("admin");
    }

    return res;
  },
  
  deleteProduct: async (id) => {
    console.log("🔑 Making deleteProduct request for ID:", id);
    const res = await api.post(`/product/remove/${id}`);

    // If response includes a token, update the auth store
    if (res.data?.token) {
      console.log("🔑 Found token in delete response, updating auth store");
      const { useAuthStore } = await import("../../stores/authStore");
      const store = useAuthStore.getState();
      store.setToken(res.data.token);
      store.setRole("admin");
    }

    return res;
  },
  updateStock: (id, data) => api.put(`/product/update-stock/${id}`, data),
};
