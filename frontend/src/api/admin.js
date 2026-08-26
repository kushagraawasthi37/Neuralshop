import api from './axios'

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  sales: (params) => api.get('/analytics/sales', { params }),
  payments: (params) => api.get('/analytics/payments', { params }),
  customers: (params) => api.get('/analytics/customers', { params }),
  inventory: () => api.get('/analytics/inventory'),
  orderStatus: (params) => api.get('/analytics/orders/status', { params }),
  coupons: (params) => api.get('/analytics/coupons', { params }),
  seller: (params) => api.get('/analytics/seller', { params }),
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
  getById: (productId) => api.get(`/admin/inventory/${productId}`),
  getLowStock: (threshold = 10) =>
    api.get('/admin/inventory/low-stock', { params: { threshold } }),
  update: (productId, totalStock, reason, size) =>
    api.patch(`/admin/inventory/${productId}`, { totalStock, reason, size }),
  importCsv: (formData) =>
    api.post('/admin/inventory/bulk/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  importJson: (inventory) =>
    api.post('/admin/inventory/bulk/json', { inventory }),
}


//It need to belong to superAdmin Right now this functionality is not implemented
export const adminCouponsApi = {
  list: () => api.get('/coupons/admin/all'),
  create: (data) => api.post('/coupons/admin/create', data),
  update: (couponId, data) => api.patch(`/coupons/admin/${couponId}`, data),
  toggle: (couponId,isActive) => api.patch(`/coupons/admin/${couponId}/toggle`),
  delete: (couponId) => api.delete(`/coupons/admin/${couponId}`),
}

export const adminReturnsApi = {
  list: () => api.get('/returns/admin/all'),
  stats: () => api.get('/returns/admin/stats'),
  approve: (returnId) => api.patch(`/returns/admin/${returnId}/approve`),
  reject: (returnId, reason) => api.patch(`/returns/admin/${returnId}/reject`, { reason }),
  processRefund: (returnId) => api.patch(`/returns/admin/${returnId}/refund`),
  markRefundFailed: (returnId) => api.patch(`/returns/admin/${returnId}/refund-failed`),
}

export const adminReviewsApi = {
  list: (params) => api.get('/reviews/admin/all', { params }),
  toggleVisibility: (reviewId) =>
    api.patch(`/reviews/admin/${reviewId}/visibility`),
  respond: (reviewId, comment) =>
    api.post(`/reviews/admin/${reviewId}/respond`, { comment }),
  deleteAny: (reviewId) => api.delete(`/reviews/admin/${reviewId}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
}

export const adminProductsApi = {
  list: (params) => api.get('/product/admin/list', { params }),
  create: (data) => api.post('/product/addproduct', data),
  update: (id, data) => api.put(`/product/update/${id}`, data),
  delete: (id) => api.post(`/product/remove/${id}`),
}

export const adminProfileApi = {
  get: () => api.get('/admin/profile'),
  update: (data) => api.patch('/admin/profile', data),
  changePassword: (data) => api.patch('/admin/change-password', data),
}
