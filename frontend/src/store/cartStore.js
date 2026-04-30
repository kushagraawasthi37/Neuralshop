import { create } from 'zustand'
import { cartApi } from '../api/cart'

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const res = await cartApi.get()
      set({ cart: res.data.data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load cart', loading: false })
    }
  },

  addItem: async (productId, quantity = 1, variant = {}) => {
    try {
      await cartApi.addItem(productId, quantity, variant)
      await get().fetchCart()
    } catch (err) {
      throw err
    }
  },

  updateItem: async (productId, quantity, variant = {}) => {
    try {
      await cartApi.updateItem(productId, quantity, variant)
      await get().fetchCart()
    } catch (err) {
      throw err
    }
  },

  removeItem: async (productId, variant = {}) => {
    try {
      await cartApi.removeItem(productId, variant)
      await get().fetchCart()
    } catch (err) {
      throw err
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear()
      set({ cart: null })
    } catch (err) {
      throw err
    }
  },

  getItemCount: () => {
    const { cart } = get()
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getTotal: () => {
    const { cart } = get()
    return cart?.total || cart?.subtotal || 0
  },
}))
