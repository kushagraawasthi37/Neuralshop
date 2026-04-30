import api from './axios'

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  sales: (params) => api.get('/analytics/sales', { params }),
  payments: () => api.get('/analytics/payments'),
  customers: () => api.get('/analytics/customers'),
  inventory: () => api.get('/analytics/inventory'),
  orderStatus: () => api.get('/analytics/orders/status'),
  coupons: () => api.get('/analytics/coupons'),
  seller: () => api.get('/analytics/seller'),
}

export const adminOrdersApi = {
  list: () => api.get('/admin/orders'),
  get: (orderId) => api.get(`/admin/orders/${orderId}`),
  updateItemStatus: (itemId, status) =>
    api.patch(`/admin/orders/order-items/${itemId}/status`, { status }),
  bulkUpdateStatus: (updates) => api.patch('/admin/orders/bulk/status', { updates }),
}

export const adminInventoryApi = {
  getAll: () => api.get('/admin/inventory'),
  getLowStock: (threshold = 10) =>
    api.get('/admin/inventory/low-stock', { params: { threshold } }),
  update: (productId, totalStock, reason) =>
    api.patch(`/admin/inventory/${productId}`, { totalStock, reason }),
}

export const adminCouponsApi = {
  list: () => api.get('/coupons/admin/all'),
  create: (data) => api.post('/coupons/admin/create', data),
  update: (couponId, data) => api.patch(`/coupons/admin/${couponId}`, data),
  toggle: (couponId) => api.patch(`/coupons/admin/${couponId}/toggle`),
  delete: (couponId) => api.delete(`/coupons/admin/${couponId}`),
}

export const adminReturnsApi = {
  list: () => api.get('/returns/admin/all'),
  stats: () => api.get('/returns/admin/stats'),
  approve: (returnId) => api.patch(`/returns/admin/${returnId}/approve`),
  reject: (returnId, reason) => api.patch(`/returns/admin/${returnId}/reject`, { reason }),
  processRefund: (returnId) => api.patch(`/returns/admin/${returnId}/refund`),
}

export const adminReviewsApi = {
  list: (params) => api.get('/reviews/admin/all', { params }),
  toggleVisibility: (reviewId) =>
    api.patch(`/reviews/admin/${reviewId}/visibility`),
  respond: (reviewId, comment) =>
    api.post(`/reviews/admin/${reviewId}/respond`, { comment }),
}

export const adminProductsApi = {
  list: (params) => api.get('/product/admin/list', { params }),
  create: (data) => api.post('/product/admin/create', data),
  update: (id, data) => api.patch(`/product/admin/${id}`, data),
  delete: (id) => api.delete(`/product/admin/${id}`),
}

export const adminProfileApi = {
  get: () => api.get('/admin/profile'),
  update: (data) => api.patch('/admin/profile', data),
  changePassword: (data) => api.patch('/admin/change-password', data),
}
