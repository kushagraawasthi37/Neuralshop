import api from './axios'

export const productApi = {
  list: (params) => api.get('/product/list', { params }),
  browse: (params) => api.get('/product/browse/all', { params }),
  getById: (id) => api.get(`/product/${id}`),
  trending: (params) => api.get('/recommendations/trending', { params }),
  topRated: (params) => api.get('/recommendations/top-rated', { params }),
  recommended: (params) => api.get('/recommendations', { params }),
  similar: (id) => api.get(`/recommendations/similar/${id}`),
  related: (id) => api.get(`/recommendations/related/${id}`),
  personalized: () => api.get('/recommendations/personalized'),
}

export const reviewApi = {
  submit: (productId, data) => api.post(`/reviews/product/${productId}`, data),
}
