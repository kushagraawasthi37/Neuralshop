import { apiMethods } from "./api.js";
import { API_ENDPOINTS } from "../constants/api.js";

export const cartService = {
  // Cart management
  getCart: async () => {
    return apiMethods.get(API_ENDPOINTS.CART.GET);
  },

  addItem: async (itemData) => {
    return apiMethods.post(API_ENDPOINTS.CART.ADD_ITEM, itemData);
  },

  updateItem: async (itemId, updateData) => {
    return apiMethods.put(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), updateData);
  },

  removeItem: async (itemId) => {
    return apiMethods.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
  },

  clearCart: async () => {
    return apiMethods.delete(API_ENDPOINTS.CART.CLEAR);
  },

  migrateGuestCart: async (sessionId) => {
    return apiMethods.post(API_ENDPOINTS.CART.MIGRATE_GUEST, { sessionId });
  },

  // Guest cart management
  initGuestCart: async () => {
    return apiMethods.post(API_ENDPOINTS.GUEST.CART_INIT);
  },

  getGuestCart: async (sessionId) => {
    return apiMethods.get(API_ENDPOINTS.GUEST.CART_GET(sessionId));
  },

  addGuestCartItem: async (sessionId, itemData) => {
    return apiMethods.post(API_ENDPOINTS.GUEST.CART_ADD(sessionId), itemData);
  },

  updateGuestCartItem: async (sessionId, itemId, updateData) => {
    return apiMethods.put(
      API_ENDPOINTS.GUEST.CART_UPDATE(sessionId, itemId),
      updateData,
    );
  },

  removeGuestCartItem: async (sessionId, itemId) => {
    return apiMethods.delete(
      API_ENDPOINTS.GUEST.CART_REMOVE(sessionId, itemId),
    );
  },

  clearGuestCart: async (sessionId) => {
    return apiMethods.delete(API_ENDPOINTS.GUEST.CART_CLEAR(sessionId));
  },
};
