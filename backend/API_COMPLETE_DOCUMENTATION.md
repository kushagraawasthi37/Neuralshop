# 🎉 COMPLETE NEUROSHOP API DOCUMENTATION

## All Endpoints (Original + New Features)

**Last Updated:** April 26, 2026

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#authentication)
2. [Products & Reviews](#products--reviews)
3. [Recommendations](#recommendations)
4. [Cart Management](#cart-management)
5. [Orders](#orders)
6. [Returns & Refunds](#returns--refunds)
7. [Payments & Coupons](#payments--coupons)
8. [User Profile & Wishlist](#user-profile--wishlist)
9. [Admin Features](#admin-features)
10. [Analytics](#analytics)

---

## 🔐 AUTHENTICATION

### User Registration

```
POST /api/auth/registration
Body: { name, email, password }
Response: { user, token, message }
```

### Email Verification

```
POST /api/auth/verify-email
Body: { email, otp }
Response: { user, verified }
```

### User Login

```
POST /api/auth/login
Body: { email, password }
Response: { user, token, message }
```

### User Logout

```
GET /api/auth/user/logout
Auth: Required
Response: { message }
```

### Admin Registration

```
POST /api/auth/adminregister
Body: { name, email, password }
Response: { admin, token, message }
```

### Admin Login

```
POST /api/auth/adminlogin
Body: { email, password }
Response: { admin, token, message }
```

### Admin Logout

```
GET /api/auth/admin/logout
Auth: Admin Required
Response: { message }
```

### Password Reset Request

```
POST /api/auth/request-password-reset
Body: { email, role }
Response: { message }
```

### Reset Password with OTP

```
POST /api/auth/reset-password
Body: { email, otp, newPassword, role }
Response: { message }
```

### Resend OTP

```
POST /api/auth/resend-otp
Body: { email, type, role }
Response: { message }
```

### Google OAuth Login

```
POST /api/auth/googlelogin
Body: { name, email }
Response: { user, token }
```

---

## 📦 PRODUCTS & REVIEWS

### List Products (with filters)

```
GET /api/product/list?category=...&price=...&search=...&skip=0&limit=10
Auth: Required
Response: { products[], total, page }
```

### Get Product Details

```
GET /api/product/:id
Response: { product }
```

### Create Product (Admin)

```
POST /api/product/addproduct
Auth: Admin Required
Body: {
  name, description, price, category, subCategory,
  sizes[], bestseller
}
Files: image1, image2, image3, image4
Response: { product, message }
```

### Update Product (Admin)

```
PUT /api/product/update/:id
Auth: Admin Required
Body: { name, description, price, category, subCategory, sizes[] }
Files: (optional)
Response: { product, message }
```

### Delete Product (Admin)

```
POST /api/product/remove/:id
Auth: Admin Required
Response: { message }
```

### Update Product Stock (Admin)

```
PUT /api/product/update-stock/:id
Auth: Admin Required
Body: { size, stockChange }
Response: { product, message }
```

### Get Admin's Products

```
GET /api/product/admin/list
Auth: Admin Required
Response: { products[] }
```

### ⭐ NEW: Create Review

```
POST /api/reviews/product/:productId
Auth: Required
Body: { rating (1-5), title, comment }
Response: { review }
```

### ⭐ NEW: Get Product Reviews

```
GET /api/reviews/product/:productId?skip=0&limit=10&sortBy=helpful|recent|rating_high|rating_low
Response: {
  reviews[],
  total,
  avgRating,
  totalReviews,
  ratingBreakdown
}
```

### ⭐ NEW: Update Review

```
PATCH /api/reviews/:reviewId
Auth: Required (own review)
Body: { rating, title, comment }
Response: { review }
```

### ⭐ NEW: Delete Review

```
DELETE /api/reviews/:reviewId
Auth: Required (own review)
Response: { message }
```

### ⭐ NEW: Mark Review as Helpful

```
POST /api/reviews/:reviewId/helpful
Response: { review }
```

### ⭐ NEW: Admin - Get All Reviews (Moderation)

```
GET /api/reviews/admin/all?skip=0&limit=20
Auth: Admin Required
Response: { reviews[], total, pages }
```

### ⭐ NEW: Admin - Toggle Review Visibility

```
PATCH /api/reviews/admin/:reviewId/visibility
Auth: Admin Required
Body: { isVisible }
Response: { review }
```

### ⭐ NEW: Admin - Respond to Review

```
POST /api/reviews/admin/:reviewId/respond
Auth: Admin Required
Body: { comment }
Response: { review }
```

---

## 🎁 RECOMMENDATIONS

### ⭐ NEW: Get Similar Products

```
GET /api/recommendations/similar/:productId?limit=10
Response: { products[] }
```

### ⭐ NEW: Get Related Products

```
GET /api/recommendations/related/:productId?limit=10
Response: { products[] }
```

### ⭐ NEW: Get Recommended Products

```
GET /api/recommendations?limit=10
Response: { products[] }
```

### ⭐ NEW: Get Top Rated Products

```
GET /api/recommendations/top-rated?limit=10
Response: { products[] }
```

### ⭐ NEW: Get Trending Products

```
GET /api/recommendations/trending?limit=10
Response: { products[] }
```

### ⭐ NEW: Get "You May Like" Products

```
GET /api/recommendations/you-may-like/:productId?limit=10
Response: { products[] }
```

### ⭐ NEW: Get Personalized Recommendations

```
GET /api/recommendations/personalized?limit=10
Auth: Required
Response: { products[] }
```

---

## 🛒 CART MANAGEMENT

### Get User Cart

```
GET /api/cart
Auth: Required
Response: { cart: { items[], total, count } }
```

### Get Cart Summary

```
GET /api/cart/summary
Auth: Required
Response: { subtotal, tax, total, itemCount }
```

### Add Item to Cart

```
POST /api/cart/items
Auth: Required
Idempotent: Yes
Body: { productId, size, quantity, priceAtAdd, name, image }
Response: { cart }
```

### Update Cart Item

```
PATCH /api/cart/items
Auth: Required
Idempotent: Yes
Body: { productId, size, quantity }
Response: { cart }
```

### Remove Item from Cart

```
DELETE /api/cart/items
Auth: Required
Body: { productId, size }
Response: { cart }
```

### Clear Cart

```
DELETE /api/cart/clear-cart
Auth: Required
Response: { cart: empty }
```

### Validate Cart

```
POST /api/cart/validate
Auth: Required
Response: { valid, errors[] }
```

### Checkout (Create Order from Cart)

```
POST /api/cart/checkout
Auth: Required
Idempotent: Yes
Response: { order }
```

### Sync Cart (Update with latest prices)

```
POST /api/cart/sync
Auth: Required
Response: { cart }
```

### Merge Guest Cart with User Cart

```
POST /api/cart/merge
Auth: Required
Body: { guestCart }
Response: { cart }
```

### ⭐ NEW: Initialize Guest Cart

```
POST /api/guest-cart/init
Body: { sessionId }
Response: { guestCart }
```

### ⭐ NEW: Get Guest Cart

```
GET /api/guest-cart?sessionId=...
Response: { guestCart }
```

### ⭐ NEW: Add Item to Guest Cart

```
POST /api/guest-cart/items?sessionId=...
Body: { productId, size, quantity, price, name, image }
Response: { guestCart }
```

### ⭐ NEW: Remove Item from Guest Cart

```
DELETE /api/guest-cart/items?sessionId=...
Body: { productId, size }
Response: { guestCart }
```

### ⭐ NEW: Clear Guest Cart

```
DELETE /api/guest-cart/clear?sessionId=...
Response: { guestCart }
```

### ⭐ NEW: Migrate Guest Cart to User Cart

```
POST /api/guest-cart/migrate
Auth: Required
Body: { sessionId }
Response: { message, items[] }
```

---

## 📦 ORDERS

### Create Order

```
POST /orders
Auth: Required
Idempotent: Yes
Body: { addressId }
Response: { orderId, status, totalAmount }
```

### Get User's Orders (with filters)

```
GET /orders?skip=0&limit=10&status=PENDING&sortBy=createdAt&order=desc&search=...
Auth: Required
Response: {
  orders[],
  total,
  skip,
  limit,
  pages
}
```

### Get Specific Order

```
GET /orders/:orderId
Auth: Required
Response: { order }
```

### Cancel Order

```
PATCH /orders/:orderId/cancel
Auth: Required
Response: { order }
```

### ⭐ NEW: Request Return

```
POST /api/returns/request
Auth: Required
Body: { orderItemId, reason, description }
Response: { returnRequest }
```

### ⭐ NEW: Get User's Return Requests

```
GET /api/returns
Auth: Required
Response: { returns[] }
```

### ⭐ NEW: Get Specific Return Request

```
GET /api/returns/:returnId
Auth: Required
Response: { returnRequest }
```

### ⭐ NEW: Cancel Return Request

```
PATCH /api/returns/:returnId/cancel
Auth: Required
Response: { returnRequest }
```

---

## 🔄 RETURNS & REFUNDS (Admin)

### ⭐ NEW: Get All Return Requests

```
GET /api/returns/admin/all?skip=0&limit=20&status=REQUESTED
Auth: Admin Required
Response: { returns[], total, pages }
```

### ⭐ NEW: Approve Return

```
PATCH /api/returns/admin/:returnId/approve
Auth: Admin Required
Body: { refundAmount }
Response: { returnRequest }
```

### ⭐ NEW: Reject Return

```
PATCH /api/returns/admin/:returnId/reject
Auth: Admin Required
Response: { returnRequest }
```

### ⭐ NEW: Process Refund

```
PATCH /api/returns/admin/:returnId/refund
Auth: Admin Required
Response: { returnRequest }
```

### ⭐ NEW: Mark Refund as Failed

```
PATCH /api/returns/admin/:returnId/refund-failed
Auth: Admin Required
Response: { returnRequest }
```

### ⭐ NEW: Get Return Statistics

```
GET /api/returns/admin/stats
Auth: Admin Required
Response: { byStatus[], totalRefunded }
```

---

## 💳 PAYMENTS & COUPONS

### Initiate Payment

```
POST /orders/:orderId/pay
Auth: Required
Idempotent: Yes
Response: { razorpayOrderId, amount, currency }
```

### Get Payment Details

```
GET /payments/:orderId
Auth: Required
Response: { payment: { status, amount, provider } }
```

### Razorpay Webhook

```
POST /webhook
Headers: { x-razorpay-signature }
Body: Razorpay payload
Response: { acknowledged }
```

### ⭐ NEW: Validate Coupon

```
POST /api/coupons/validate
Auth: Required
Body: { couponCode, orderAmount }
Response: { coupon, discountAmount, finalAmount }
```

### ⭐ NEW: Get Coupon Info

```
GET /api/coupons/:code
Response: { coupon }
```

### ⭐ NEW: Apply Coupon to Order

```
POST /api/coupons/:orderId/apply
Auth: Required
Body: { couponCode }
Response: { orderId, couponCode, discountAmount, newTotal }
```

### ⭐ NEW: Create Coupon (Admin)

```
POST /api/coupons/admin/create
Auth: Admin Required
Body: {
  code, discountType (PERCENTAGE|FIXED), discountValue,
  minOrderAmount, maxUses, maxUsesPerUser,
  startDate, expiryDate
}
Response: { coupon }
```

### ⭐ NEW: Get All Coupons (Admin)

```
GET /api/coupons/admin/all?skip=0&limit=20
Auth: Admin Required
Response: { coupons[], total, pages }
```

### ⭐ NEW: Update Coupon (Admin)

```
PATCH /api/coupons/admin/:couponId
Auth: Admin Required
Body: { code, discountValue, ... }
Response: { coupon }
```

### ⭐ NEW: Toggle Coupon Status (Admin)

```
PATCH /api/coupons/admin/:couponId/toggle
Auth: Admin Required
Body: { isActive }
Response: { coupon }
```

### ⭐ NEW: Delete Coupon (Admin)

```
DELETE /api/coupons/admin/:couponId
Auth: Admin Required
Response: { message }
```

---

## 👤 USER PROFILE & WISHLIST

### Get User Profile

```
GET /api/user/profile
Auth: Required
Response: { user }
```

### Update User Profile

```
PATCH /api/user/profile
Auth: Required
Body: { name, phone, avatar, ... }
Response: { user }
```

### Get User Addresses

```
GET /api/user/addresses
Auth: Required
Response: { addresses[] }
```

### Create Address

```
POST /api/user/addresses
Auth: Required
Body: { label, street, city, state, zipCode, country, phone, isDefault }
Response: { address }
```

### Update Address

```
PATCH /api/user/addresses/:addressId
Auth: Required
Body: { label, street, city, state, zipCode, country, phone, isDefault }
Response: { address }
```

### Delete Address

```
DELETE /api/user/addresses/:addressId
Auth: Required
Response: { message }
```

### Get Default Address

```
GET /api/user/addresses/default
Auth: Required
Response: { address }
```

### ⭐ NEW: Get Wishlist

```
GET /api/wishlist
Auth: Required
Response: { wishlist: { items[], userId } }
```

### ⭐ NEW: Add to Wishlist

```
POST /api/wishlist/add
Auth: Required
Body: { productId }
Response: { wishlist }
```

### ⭐ NEW: Remove from Wishlist

```
POST /api/wishlist/remove
Auth: Required
Body: { productId }
Response: { wishlist }
```

### ⭐ NEW: Check if in Wishlist

```
GET /api/wishlist/check?productId=...
Auth: Required
Response: { inWishlist: boolean }
```

### ⭐ NEW: Clear Wishlist

```
DELETE /api/wishlist/clear
Auth: Required
Response: { wishlist }
```

---

## 🛠 ADMIN FEATURES

### Get Admin's Orders

```
GET /api/admin/orders
Auth: Admin Required
Response: { orders[] }
```

### Get Specific Admin Order

```
GET /api/admin/orders/:orderId
Auth: Admin Required
Response: { order }
```

### Update Order Item Status

```
PATCH /api/admin/orders/order-items/:itemId/status
Auth: Admin Required
Body: { status: PROCESSING|SHIPPED|DELIVERED|CANCELLED }
Response: { result }
```

### Bulk Update Order Item Status

```
PATCH /api/admin/orders/order-items/bulk/status
Auth: Admin Required
Body: { updates: [{ itemId, status }] }
Response: { result }
```

### Get Low Stock Products

```
GET /api/admin/inventory/low-stock?threshold=10
Auth: Admin Required
Response: { products[] }
```

### Bulk Update Inventory (JSON)

```
POST /api/admin/inventory/bulk/json
Auth: Admin Required
Body: { inventory: [{ productId, size, totalStock }] }
Response: { result }
```

### Bulk Update Inventory (CSV)

```
POST /api/admin/inventory/bulk/csv
Auth: Admin Required
File: CSV (productId,size,totalStock)
Response: { result }
```

---

## 📊 ANALYTICS (NEW)

### ⭐ NEW: Dashboard Stats

```
GET /api/analytics/dashboard
Auth: Admin Required
Response: {
  totalOrders,
  totalRevenue,
  totalCustomers,
  pendingOrders,
  avgOrderValue
}
```

### ⭐ NEW: Sales Analytics

```
GET /api/analytics/sales?startDate=...&endDate=...
Auth: Admin Required
Response: {
  dailySales[],
  topProducts[],
  revenueByStatus[]
}
```

### ⭐ NEW: Payment Analytics

```
GET /api/analytics/payments?startDate=...&endDate=...
Auth: Admin Required
Response: {
  paymentStatus[],
  paymentProvider[],
  failedPayments,
  refundedAmount
}
```

### ⭐ NEW: Customer Analytics

```
GET /api/analytics/customers?startDate=...&endDate=...
Auth: Admin Required
Response: {
  newCustomers,
  repeatCustomers,
  avgCustomerValue,
  topCustomers[]
}
```

### ⭐ NEW: Inventory Analytics

```
GET /api/analytics/inventory
Auth: Admin Required
Response: {
  lowStockItems,
  totalProducts,
  totalStock,
  mostReserved[]
}
```

### ⭐ NEW: Order Status Distribution

```
GET /api/analytics/orders/status?startDate=...&endDate=...
Auth: Admin Required
Response: { distribution[] }
```

### ⭐ NEW: Coupon Analytics

```
GET /api/analytics/coupons?startDate=...&endDate=...
Auth: Admin Required
Response: {
  topCoupons[],
  totalDiscountGiven
}
```

### ⭐ NEW: Seller Analytics

```
GET /api/analytics/seller?startDate=...&endDate=...
Auth: Admin Required
Response: {
  totalOrders,
  totalRevenue,
  statusBreakdown[],
  topProducts[]
}
```

---

## 🔑 KEY FEATURES SUMMARY

### Features Implemented ✅

1. **Reviews & Ratings**
   - Create, read, update, delete reviews
   - Rating aggregation
   - Admin moderation
   - Admin responses

2. **Wishlist**
   - Add/remove products
   - View wishlist
   - Check if in wishlist
   - Clear wishlist

3. **Coupons & Discounts**
   - Create and manage coupons
   - PERCENTAGE and FIXED discount types
   - Coupon validation
   - Apply to orders
   - Usage tracking

4. **Returns & Refunds**
   - User request returns
   - Admin approval/rejection
   - Refund processing
   - Refund status tracking

5. **Enhanced Orders**
   - Filter by status
   - Sort by date/amount/status
   - Search by order ID
   - Pagination

6. **Product Recommendations**
   - Similar products
   - Related products
   - Top rated
   - Trending
   - You may like
   - Personalized

7. **Guest Cart Persistence**
   - Persistent storage for guest carts
   - Session-based tracking
   - 7-day expiration
   - Migration to user cart after login

8. **Admin Analytics**
   - Dashboard overview
   - Sales analytics
   - Payment analytics
   - Customer analytics
   - Inventory insights
   - Order distribution
   - Coupon usage
   - Seller performance

---

## 🚀 DEPLOYMENT NOTES

- All timestamps are UTC
- Pagination: default limit = 10-20
- Authentication: JWT tokens in cookies + localStorage
- Idempotency: use `Idempotency-Key` header for POST/PATCH operations
- File uploads: max 10MB
- Database: PostgreSQL + MongoDB hybrid
- Cache: Redis for sessions and performance

---

## 📞 SUPPORT

For API issues or questions, contact the development team.

**API Version:** 2.1.0  
**Last Updated:** 2026-04-26
