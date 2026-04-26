// Application Messages Constants
export const MESSAGES = {
  // Success messages
  SUCCESS: {
    LOGIN: "Successfully logged in!",
    REGISTER: "Account created successfully! Please verify your email.",
    LOGOUT: "Successfully logged out!",
    EMAIL_VERIFIED: "Email verified successfully!",
    PASSWORD_RESET: "Password reset email sent!",
    PASSWORD_CHANGED: "Password changed successfully!",
    PROFILE_UPDATED: "Profile updated successfully!",
    ADDRESS_ADDED: "Address added successfully!",
    ADDRESS_UPDATED: "Address updated successfully!",
    ADDRESS_DELETED: "Address deleted successfully!",
    PRODUCT_ADDED_TO_CART: "Product added to cart!",
    CART_UPDATED: "Cart updated successfully!",
    CART_CLEARED: "Cart cleared successfully!",
    ORDER_PLACED: "Order placed successfully!",
    ORDER_CANCELLED: "Order cancelled successfully!",
    WISHLIST_ADDED: "Added to wishlist!",
    WISHLIST_REMOVED: "Removed from wishlist!",
    REVIEW_SUBMITTED: "Review submitted successfully!",
    RETURN_REQUESTED: "Return request submitted successfully!",
    COUPON_APPLIED: "Coupon applied successfully!",
  },

  // Error messages
  ERROR: {
    GENERIC: "Something went wrong. Please try again.",
    NETWORK: "Network error. Please check your connection.",
    UNAUTHORIZED: "Please log in to continue.",
    FORBIDDEN: "You don't have permission to access this resource.",
    NOT_FOUND: "The requested resource was not found.",
    VALIDATION: "Please check your input and try again.",
    EMAIL_EXISTS: "An account with this email already exists.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
    INVALID_TOKEN: "Invalid or expired token.",
    PASSWORD_TOO_WEAK: "Password must be at least 8 characters long.",
    PASSWORDS_DONT_MATCH: "Passwords do not match.",
    INVALID_EMAIL: "Please enter a valid email address.",
    REQUIRED_FIELD: "This field is required.",
    INVALID_PHONE: "Please enter a valid phone number.",
    INVALID_ZIPCODE: "Please enter a valid zip code.",
    CART_EMPTY: "Your cart is empty.",
    INSUFFICIENT_STOCK: "Insufficient stock for this product.",
    PAYMENT_FAILED: "Payment failed. Please try again.",
    ORDER_NOT_FOUND: "Order not found.",
    PRODUCT_NOT_FOUND: "Product not found.",
    COUPON_INVALID: "Invalid or expired coupon code.",
    COUPON_EXPIRED: "This coupon has expired.",
    COUPON_USAGE_LIMIT: "This coupon has reached its usage limit.",
    RETURN_NOT_ALLOWED: "Returns are not allowed for this order.",
    REVIEW_ALREADY_EXISTS: "You have already reviewed this product.",
    FILE_TOO_LARGE: "File size must be less than 5MB.",
    INVALID_FILE_TYPE: "Invalid file type. Please upload an image.",
  },

  // Validation messages
  VALIDATION: {
    REQUIRED: "This field is required",
    EMAIL: "Please enter a valid email address",
    PASSWORD_MIN: "Password must be at least 8 characters",
    PASSWORD_MATCH: "Passwords must match",
    PHONE: "Please enter a valid phone number",
    ZIPCODE: "Please enter a valid zip code",
    NAME_MIN: "Name must be at least 2 characters",
    NAME_MAX: "Name must be less than 50 characters",
    ADDRESS_MIN: "Address must be at least 10 characters",
    COMMENT_MIN: "Comment must be at least 10 characters",
    COMMENT_MAX: "Comment must be less than 500 characters",
    TITLE_MIN: "Title must be at least 5 characters",
    TITLE_MAX: "Title must be less than 100 characters",
    RATING_REQUIRED: "Please select a rating",
    QUANTITY_MIN: "Quantity must be at least 1",
    PRICE_MIN: "Price must be greater than 0",
    DISCOUNT_MIN: "Discount must be between 0 and 100",
    STOCK_MIN: "Stock must be 0 or greater",
  },

  // Confirmation messages
  CONFIRM: {
    LOGOUT: "Are you sure you want to log out?",
    DELETE_ADDRESS: "Are you sure you want to delete this address?",
    CANCEL_ORDER: "Are you sure you want to cancel this order?",
    CLEAR_CART: "Are you sure you want to clear your cart?",
    DELETE_PRODUCT: "Are you sure you want to delete this product?",
    APPROVE_RETURN: "Are you sure you want to approve this return?",
    REJECT_RETURN: "Are you sure you want to reject this return?",
  },

  // Info messages
  INFO: {
    LOADING: "Loading...",
    SAVING: "Saving...",
    PROCESSING: "Processing...",
    NO_DATA: "No data available",
    NO_PRODUCTS: "No products found",
    NO_ORDERS: "No orders found",
    NO_ADDRESSES: "No addresses found",
    NO_WISHLIST: "Your wishlist is empty",
    NO_RETURNS: "No returns found",
    NO_REVIEWS: "No reviews yet",
    SEARCH_NO_RESULTS: "No results found for your search",
    CART_MIGRATED: "Your guest cart has been merged with your account",
  },

  // Status messages
  STATUS: {
    PENDING: "Pending",
    PROCESSING: "Processing",
    CONFIRMED: "Confirmed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    REFUNDED: "Refunded",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    OUT_OF_STOCK: "Out of Stock",
    LOW_STOCK: "Low Stock",
  },

  // Form labels and placeholders
  FORM: {
    EMAIL: "Email Address",
    PASSWORD: "Password",
    CONFIRM_PASSWORD: "Confirm Password",
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    FULL_NAME: "Full Name",
    PHONE: "Phone Number",
    ADDRESS: "Address",
    CITY: "City",
    STATE: "State",
    ZIPCODE: "Zip Code",
    COUNTRY: "Country",
    SEARCH: "Search products...",
    COMMENT: "Your comment...",
    TITLE: "Title",
    QUANTITY: "Quantity",
    PRICE: "Price",
    DISCOUNT: "Discount (%)",
    STOCK: "Stock",
    DESCRIPTION: "Description",
    CATEGORY: "Category",
    BRAND: "Brand",
    SIZE: "Size",
    COLOR: "Color",
  },
};

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Toast durations
export const TOAST_DURATION = {
  SHORT: 3000, // 3 seconds
  MEDIUM: 5000, // 5 seconds
  LONG: 7000, // 7 seconds
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};
