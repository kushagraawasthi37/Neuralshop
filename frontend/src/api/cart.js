import api from './axios'
import { v4 as uuid } from '../lib/uuid'

export const cartApi = {
  get: () => api.get('/cart'),
  summary: () => api.get('/cart/summary'),

  // size: string (e.g. "M"), priceAtAdd/name/image required by cart model
  addItem: (productId, quantity, size, priceAtAdd, name, image) =>
    api.post('/cart/items', { productId, quantity, size, priceAtAdd, name, image }, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  updateItem: (productId, quantity, size) =>
    api.patch('/cart/items', { productId, quantity, size }, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  removeItem: (productId, size) =>
    api.delete('/cart/items', { data: { productId, size } }),

  clear: () => api.delete('/cart/clear-cart'),

  merge: (guestCart) =>
    api.post('/cart/merge', { guestCart }, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  validate: () => api.post('/cart/validate'),

  checkout: (addressId, couponCode) =>
    api.post('/cart/checkout', { addressId, couponCode }, {
      headers: { 'Idempotency-Key': uuid() },
    }),
}
