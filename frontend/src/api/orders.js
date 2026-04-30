import rootApi from './rootAxios'
import api from './axios'
import { v4 as uuid } from '../lib/uuid'

export const ordersApi = {
  create: (body) =>
    rootApi.post('/orders/orders', body, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  list: (params) => rootApi.get('/orders/orders', { params }),

  get: (orderId) => rootApi.get(`/orders/orders/${orderId}`),

  cancel: (orderId) => rootApi.patch(`/orders/orders/${orderId}/cancel`),

  pay: (orderId) =>
    rootApi.post(`/orders/${orderId}/pay`, {}, {
      headers: { 'Idempotency-Key': uuid() },
    }),

  getPayment: (orderId) => rootApi.get(`/payments/${orderId}`),
}

export const couponsApi = {
  validate: (code, orderAmount) =>
    api.post('/coupons/validate', { code, orderAmount }),

  getByCode: (code) => api.get(`/coupons/${code}`),
}
