import api from './axios'

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),

  getAddresses: () => api.get('/user/addresses'),
  getDefaultAddress: () => api.get('/user/addresses/default'),
  createAddress: (data) => api.post('/user/addresses', data),
  updateAddress: (addressId, data) => api.patch(`/user/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/user/addresses/${addressId}`),
}

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.post('/wishlist/remove', { productId }),
  check: (productId) => api.get('/wishlist/check', { params: { productId } }),
  clear: () => api.delete('/wishlist/clear'),
}

export const returnsApi = {
  request: (data) => api.post('/returns/request', data),
  list: () => api.get('/returns'),
  get: (returnId) => api.get(`/returns/${returnId}`),
  cancel: (returnId) => api.patch(`/returns/${returnId}/cancel`),
}
