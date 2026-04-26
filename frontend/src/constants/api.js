// API Endpoints Constants
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESEND_OTP: "/api/auth/resend-otp",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    VERIFY_TOKEN: "/api/auth/verify-token",
  },

  // User endpoints
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/profile",
    ADDRESSES: "/api/user/addresses",
    ADDRESS: (id) => `/api/user/addresses/${id}`,
  },

  // Product endpoints
  PRODUCT: {
    LIST: "/api/products",
    DETAIL: (id) => `/api/products/${id}`,
    CREATE: "/api/products",
    UPDATE: (id) => `/api/products/${id}`,
    DELETE: (id) => `/api/products/${id}`,
    STOCK: (id) => `/api/products/${id}/stock`,
    SEARCH: "/api/products/search",
    CATEGORIES: "/api/products/categories",
    RECOMMENDED: "/api/products/recommended",
  },

  // Cart endpoints
  CART: {
    GET: "/api/cart",
    ADD_ITEM: "/api/cart/items",
    UPDATE_ITEM: (id) => `/api/cart/items/${id}`,
    REMOVE_ITEM: (id) => `/api/cart/items/${id}`,
    CLEAR: "/api/cart/clear",
    MIGRATE_GUEST: "/api/cart/migrate-guest",
  },

  // Order endpoints
  ORDER: {
    CREATE: "/api/orders",
    LIST: "/api/orders",
    DETAIL: (id) => `/api/orders/${id}`,
    CANCEL: (id) => `/api/orders/${id}/cancel`,
    TRACKING: (id) => `/api/orders/${id}/tracking`,
  },

  // Payment endpoints
  PAYMENT: {
    INITIATE: "/api/payments/initiate",
    VERIFY: "/api/payments/verify",
    DETAIL: (id) => `/api/payments/${id}`,
    WEBHOOK: "/api/payments/webhook",
  },

  // Wishlist endpoints
  WISHLIST: {
    GET: "/api/wishlist",
    ADD: "/api/wishlist",
    REMOVE: (id) => `/api/wishlist/${id}`,
    CHECK: (id) => `/api/wishlist/check/${id}`,
    CLEAR: "/api/wishlist/clear",
  },

  // Review endpoints
  REVIEW: {
    LIST: (productId) => `/api/products/${productId}/reviews`,
    CREATE: (productId) => `/api/products/${productId}/reviews`,
    UPDATE: (productId, reviewId) =>
      `/api/products/${productId}/reviews/${reviewId}`,
    DELETE: (productId, reviewId) =>
      `/api/products/${productId}/reviews/${reviewId}`,
    HELPFUL: (productId, reviewId) =>
      `/api/products/${productId}/reviews/${reviewId}/helpful`,
  },

  // Coupon endpoints
  COUPON: {
    VALIDATE: "/api/coupons/validate",
    LIST: "/api/coupons",
    CREATE: "/api/coupons",
    UPDATE: (id) => `/api/coupons/${id}`,
    DELETE: (id) => `/api/coupons/${id}`,
    TOGGLE: (id) => `/api/coupons/${id}/toggle`,
  },

  // Return endpoints
  RETURN: {
    REQUEST: "/api/returns",
    LIST: "/api/returns",
    DETAIL: (id) => `/api/returns/${id}`,
    CANCEL: (id) => `/api/returns/${id}/cancel`,
    APPROVE: (id) => `/api/returns/${id}/approve`,
    REJECT: (id) => `/api/returns/${id}/reject`,
    PROCESS_REFUND: (id) => `/api/returns/${id}/refund`,
  },

  // Admin endpoints
  ADMIN: {
    // Dashboard
    DASHBOARD: "/api/admin/dashboard",

    // Products
    PRODUCTS: "/api/admin/products",
    PRODUCT_DETAIL: (id) => `/api/admin/products/${id}`,

    // Orders
    ORDERS: "/api/admin/orders",
    ORDER_DETAIL: (id) => `/api/admin/orders/${id}`,
    ORDER_STATUS: (id) => `/api/admin/orders/${id}/status`,

    // Inventory
    INVENTORY: "/api/admin/inventory",
    INVENTORY_BULK_UPDATE: "/api/admin/inventory/bulk-update",
    INVENTORY_LOW_STOCK: "/api/admin/inventory/low-stock",

    // Analytics
    ANALYTICS: {
      SALES: "/api/admin/analytics/sales",
      PAYMENTS: "/api/admin/analytics/payments",
      CUSTOMERS: "/api/admin/analytics/customers",
      INVENTORY: "/api/admin/analytics/inventory",
      ORDERS: "/api/admin/analytics/orders",
      COUPONS: "/api/admin/analytics/coupons",
      SELLERS: "/api/admin/analytics/sellers",
    },

    // Coupons
    COUPONS: "/api/admin/coupons",
    COUPON_DETAIL: (id) => `/api/admin/coupons/${id}`,

    // Returns
    RETURNS: "/api/admin/returns",
    RETURN_DETAIL: (id) => `/api/admin/returns/${id}`,

    // Reviews
    REVIEWS: "/api/admin/reviews",
    REVIEW_DETAIL: (id) => `/api/admin/reviews/${id}`,
    REVIEW_MODERATE: (id) => `/api/admin/reviews/${id}/moderate`,
  },

  // Guest cart endpoints
  GUEST: {
    CART_INIT: "/api/guest/cart/init",
    CART_GET: (sessionId) => `/api/guest/cart/${sessionId}`,
    CART_ADD: (sessionId) => `/api/guest/cart/${sessionId}/items`,
    CART_UPDATE: (sessionId, itemId) =>
      `/api/guest/cart/${sessionId}/items/${itemId}`,
    CART_REMOVE: (sessionId, itemId) =>
      `/api/guest/cart/${sessionId}/items/${itemId}`,
    CART_CLEAR: (sessionId) => `/api/guest/cart/${sessionId}/clear`,
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds
