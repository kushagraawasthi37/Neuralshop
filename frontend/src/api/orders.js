import api from './axios'
import { v4 as uuid } from '../lib/uuid'

export const ordersApi = {
  create: (body) =>
    api.post('/orders', body, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  list: (params) => api.get('/orders/my-orders', { params }),

  get: (orderId) => api.get(`/orders/${orderId}`),

  cancel: (orderId) => api.patch(`/orders/${orderId}/cancel`),

  pay: (orderId) =>
    api.post(`/orders/${orderId}/pay`, {}, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  getPayment: (orderId) => api.get(`/payments/${orderId}`),
}

export const couponsApi = {
  validate: (code, orderAmount) =>
    api.post('/coupons/validate', { couponCode: code, orderAmount }),

  getByCode: (code) => api.get(`/coupons/${code}`),

  apply: (orderId, couponCode) =>
    api.post(`/coupons/${orderId}/apply`, { couponCode }),
}
