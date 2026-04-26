// Application Routes Constants
export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",
  VERIFY_EMAIL: "/verify-email/:token",

  // User routes (protected)
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  SEARCH: "/search",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation/:orderId",
  ORDER_TRACKING: "/orders/:orderId/tracking",
  ORDER_HISTORY: "/orders",
  PROFILE: "/profile",
  ADDRESSES: "/profile/addresses",
  WISHLIST: "/wishlist",
  RETURNS: "/returns",
  RETURN_DETAIL: "/returns/:id",

  // Admin routes (protected)
  ADMIN: {
    DASHBOARD: "/admin",
    PRODUCTS: "/admin/products",
    PRODUCT_EDIT: "/admin/products/:id/edit",
    PRODUCT_CREATE: "/admin/products/create",
    ORDERS: "/admin/orders",
    ORDER_DETAIL: "/admin/orders/:id",
    INVENTORY: "/admin/inventory",
    ANALYTICS: "/admin/analytics",
    COUPONS: "/admin/coupons",
    COUPON_EDIT: "/admin/coupons/:id/edit",
    COUPON_CREATE: "/admin/coupons/create",
    RETURNS: "/admin/returns",
    RETURN_DETAIL: "/admin/returns/:id",
    REVIEWS: "/admin/reviews",
  },

  // Utility routes
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",
};

// Route groups for navigation
export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
  ],

  USER: [
    ROUTES.PRODUCTS,
    ROUTES.PRODUCT_DETAIL,
    ROUTES.SEARCH,
    ROUTES.CART,
    ROUTES.CHECKOUT,
    ROUTES.ORDER_CONFIRMATION,
    ROUTES.ORDER_TRACKING,
    ROUTES.ORDER_HISTORY,
    ROUTES.PROFILE,
    ROUTES.ADDRESSES,
    ROUTES.WISHLIST,
    ROUTES.RETURNS,
    ROUTES.RETURN_DETAIL,
  ],

  ADMIN: Object.values(ROUTES.ADMIN),
};

// Breadcrumb configurations
export const BREADCRUMBS = {
  [ROUTES.HOME]: [{ label: "Home", path: ROUTES.HOME }],
  [ROUTES.PRODUCTS]: [
    { label: "Home", path: ROUTES.HOME },
    { label: "Products", path: ROUTES.PRODUCTS },
  ],
  [ROUTES.CART]: [
    { label: "Home", path: ROUTES.HOME },
    { label: "Cart", path: ROUTES.CART },
  ],
  [ROUTES.CHECKOUT]: [
    { label: "Home", path: ROUTES.HOME },
    { label: "Cart", path: ROUTES.CART },
    { label: "Checkout", path: ROUTES.CHECKOUT },
  ],
  [ROUTES.PROFILE]: [
    { label: "Home", path: ROUTES.HOME },
    { label: "Profile", path: ROUTES.PROFILE },
  ],
  [ROUTES.WISHLIST]: [
    { label: "Home", path: ROUTES.HOME },
    { label: "Wishlist", path: ROUTES.WISHLIST },
  ],
  [ROUTES.RETURNS]: [
    { label: "Home", path: ROUTES.HOME },
    { label: "Returns", path: ROUTES.RETURNS },
  ],
  [ROUTES.ADMIN.DASHBOARD]: [{ label: "Admin", path: ROUTES.ADMIN.DASHBOARD }],
  [ROUTES.ADMIN.PRODUCTS]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Products", path: ROUTES.ADMIN.PRODUCTS },
  ],
  [ROUTES.ADMIN.ORDERS]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Orders", path: ROUTES.ADMIN.ORDERS },
  ],
  [ROUTES.ADMIN.INVENTORY]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Inventory", path: ROUTES.ADMIN.INVENTORY },
  ],
  [ROUTES.ADMIN.ANALYTICS]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Analytics", path: ROUTES.ADMIN.ANALYTICS },
  ],
  [ROUTES.ADMIN.COUPONS]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Coupons", path: ROUTES.ADMIN.COUPONS },
  ],
  [ROUTES.ADMIN.RETURNS]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Returns", path: ROUTES.ADMIN.RETURNS },
  ],
  [ROUTES.ADMIN.REVIEWS]: [
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "Reviews", path: ROUTES.ADMIN.REVIEWS },
  ],
};

// Navigation menu configurations
export const NAVIGATION = {
  USER: [
    { label: "Home", path: ROUTES.HOME, icon: "home" },
    { label: "Products", path: ROUTES.PRODUCTS, icon: "shopping-bag" },
    { label: "Cart", path: ROUTES.CART, icon: "shopping-cart" },
    { label: "Orders", path: ROUTES.ORDER_HISTORY, icon: "clipboard-list" },
    { label: "Wishlist", path: ROUTES.WISHLIST, icon: "heart" },
    { label: "Profile", path: ROUTES.PROFILE, icon: "user" },
  ],

  ADMIN: [
    { label: "Dashboard", path: ROUTES.ADMIN.DASHBOARD, icon: "chart-bar" },
    { label: "Products", path: ROUTES.ADMIN.PRODUCTS, icon: "cube" },
    { label: "Orders", path: ROUTES.ADMIN.ORDERS, icon: "clipboard-list" },
    { label: "Inventory", path: ROUTES.ADMIN.INVENTORY, icon: "archive" },
    { label: "Analytics", path: ROUTES.ADMIN.ANALYTICS, icon: "chart-pie" },
    { label: "Coupons", path: ROUTES.ADMIN.COUPONS, icon: "ticket" },
    { label: "Returns", path: ROUTES.ADMIN.RETURNS, icon: "refresh" },
    { label: "Reviews", path: ROUTES.ADMIN.REVIEWS, icon: "star" },
  ],
};
