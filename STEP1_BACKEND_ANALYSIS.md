# 🔍 STEP 1: COMPLETE BACKEND ANALYSIS

**NeuralShop E-Commerce Platform**  
**Date:** April 26, 2026  
**Status:** Backend Analysis Complete

---

## 📊 EXECUTIVE SUMMARY

Your backend is a **production-grade e-commerce platform** with:

- ✅ **105+ endpoints** (user + admin)
- ✅ **Hybrid database architecture** (PostgreSQL + MongoDB + Redis)
- ✅ **Multi-vendor order system** with seller management
- ✅ **Complete payment integration** (Razorpay)
- ✅ **Advanced features:** Reviews, wishlists, coupons, returns, recommendations, analytics
- ✅ **Event-driven architecture** (Kafka)
- ✅ **Idempotency protection** on critical operations

---

## 🏗️ TECHNOLOGY STACK

| Layer                | Technology                    |
| -------------------- | ----------------------------- |
| **API Framework**    | Express.js 5.1.0              |
| **Node.js Runtime**  | Node.js (ES modules)          |
| **Main DB**          | PostgreSQL + Prisma ORM 7.7.0 |
| **Flexible DB**      | MongoDB + Mongoose 8.19.2     |
| **Caching/Sessions** | Redis 4.6.0                   |
| **Event Streaming**  | Kafka 2.2.4                   |
| **Payment Provider** | Razorpay 2.9.6                |
| **Image Hosting**    | Cloudinary 2.8.0              |
| **Authentication**   | JWT with bcrypt hashing       |
| **Logging**          | Winston 3.19.0                |
| **Validation**       | Express-validator 7.3.1       |

---

## 📁 DATABASE ARCHITECTURE

### PostgreSQL (Prisma) - Transactional Data

**Purpose:** ACID transactions, reliable order/payment processing

#### Core Models:

1. **Order** - Main order record
   - Fields: id, userId, status, totalAmount, addressId, createdAt
   - Statuses: PENDING, PARTIALLY_SHIPPED, SHIPPED, DELIVERED, COMPLETED, CANCELLED
   - Relations: Multiple items (multi-vendor), payment, address

2. **OrderItem** - Per-seller items
   - Fields: id, orderId, productId, size, **sellerId**, quantity, price, status
   - Purpose: Multi-vendor support (each seller has own order items)
   - Statuses: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

3. **Payment** - Payment tracking
   - Fields: id, orderId (unique), status, amount, provider, razorpayOrderId, razorpayPaymentId
   - Statuses: pending, success, failed, refunded
   - Provider: razorpay (extensible to stripe, etc.)

4. **Address** - User saved addresses
   - Fields: id, userId, label, street, city, state, zipCode, country, phone, isDefault
   - Purpose: Quick checkout, multiple addresses per user

5. **Inventory** - Stock management
   - Key: (productId, size) composite primary key
   - Fields: totalStock, reservedStock
   - Purpose: Size-specific inventory (XS, S, M, L, XL, XXL)

6. **IdempotencyKey** - Duplicate prevention
   - Fields: key, userId, method, endpoint, response, status, expiresAt
   - Purpose: Prevent duplicate charges on payment/order creation

7. **Coupon** - Discount codes (NEW)
   - Fields: code, discountType (PERCENTAGE|FIXED), discountValue, minOrderAmount, maxUses, maxUsesPerUser, startDate, expiryDate, isActive
8. **OrderDiscount** - Coupon usage tracking (NEW)
   - Fields: orderId, couponId, discountAmount
   - Purpose: Track which coupons applied to which orders

9. **ReturnRequest** - Return/refund management (NEW)
   - Fields: id, userId, orderItemId, reason, status, refundAmount, createdAt
   - Statuses: REQUESTED, APPROVED, REJECTED, REFUNDED, REFUND_FAILED

10. **GuestCart** - Session-based guest cart (NEW)
    - Fields: sessionId, items (JSON), total, expiresAt (7 days)
    - Purpose: Persistent cart for guest users before login

### MongoDB - Flexible Schema Data

**Purpose:** Flexible schemas, rich queries, fast reads

#### Collections:

1. **User** (MongoDB)
   - Fields: \_id, name, email, password, phone, avatar, role, emailVerified, isActive, createdAt
   - Purpose: User profiles
   - Relations: Addresses (PostgreSQL), Orders (PostgreSQL), Wishlist (MongoDB)

2. **Admin** (MongoDB)
   - Fields: \_id, name, email, password, role, permissions, emailVerified, isActive
   - Roles: admin, super_admin
   - Purpose: Admin/seller management

3. **Product** (MongoDB)
   - Fields: \_id, name, description, price, category, subCategory, images[], sizes[], seller (email), ratings, reviews, createdAt
   - Purpose: Product catalog with rich metadata
   - Relations: Reviews (MongoDB), Inventory (PostgreSQL), Wishlists (MongoDB)

4. **Review** (MongoDB) (NEW)
   - Fields: \_id, productId, userId, rating (1-5), title, comment, helpful, isVisible, adminResponse, createdAt
   - Purpose: Product reviews with admin moderation
   - Rating auto-aggregates to product

5. **Wishlist** (MongoDB) (NEW)
   - Fields: \_id, userId (unique), items: [productId], createdAt
   - Purpose: Saved products per user

### Redis - Cache & Sessions

**Purpose:** Fast access, sessions, locks, rate limiting

- **Cart Sessions:** User cart in-memory
- **Token Blacklist:** Logged-out tokens
- **Rate Limiting:** Request throttling
- **Locks:** Concurrent update prevention

---

## 🔐 AUTHENTICATION SYSTEM

### Auth Flows

#### 1. User Registration

```
POST /api/auth/registration
Input: { name, email, password }
Output: { user, token, message }
Process:
  - Validate email (unique)
  - Hash password with bcrypt
  - Generate JWT token (userId only)
  - Store in Redis/cookie
```

#### 2. Email Verification (OTP)

```
POST /api/auth/verify-email
Input: { email, otp }
Output: { user, verified }
Purpose: Confirm user email before login
```

#### 3. User Login

```
POST /api/auth/login
Input: { email, password }
Output: { user, token, message }
Token: { userId } → Stored in httpOnly cookie + localStorage
```

#### 4. Admin Registration

```
POST /api/auth/adminregister
Input: { name, email, password }
Output: { admin, token, message }
Role: Admin or super_admin
```

#### 5. Admin Login

```
POST /api/auth/adminlogin
Input: { email, password }
Output: { admin, token, message }
Token: { email, adminId } → Different from user token
```

#### 6. Logout

```
User:  GET /api/auth/user/logout (isAuth required)
Admin: GET /api/auth/admin/logout (isAuthAdmin required)
Action: Add token to Redis blacklist
```

#### 7. Password Reset

```
POST /api/auth/request-password-reset
Input: { email, role }
Action: Send OTP via email/SendGrid

POST /api/auth/reset-password
Input: { email, otp, newPassword, role }
Action: Update password if OTP valid
```

#### 8. OAuth (Google)

```
POST /api/auth/googlelogin
Input: { name, email }
Output: { user, token }
Action: Auto-create user if doesn't exist
```

### Token Structure

**User Token:**

```json
{
  "userId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Admin Token:**

```json
{
  "email": "admin@example.com",
  "adminId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 👤 USER FLOW - COMPLETE JOURNEY

### 1. Landing Page

```
GET /api/product/list (public, with filters)
GET /api/recommendations (various endpoints)
Purpose: Browse featured products
No auth required
```

### 2. Product Discovery

```
GET /api/product/list?category=...&price=...&search=...&skip=...&limit=...
GET /api/reviews/product/:productId (read only)
GET /api/recommendations/similar/:productId
GET /api/recommendations/related/:productId
Purpose: Search, filter, view recommendations
```

### 3. Product Details

```
GET /api/product/:id
GET /api/reviews/product/:id (with ratings)
POST /api/reviews/product/:id (create review - isAuth required)
GET /api/recommendations/you-may-like/:id
GET /api/wishlist/check?productId=...
POST /api/wishlist/add
Purpose: View product, read/write reviews, add to wishlist
```

### 4. Cart Management

```
GET /api/cart (view)
POST /api/cart/items (add - idempotent)
PATCH /api/cart/items (update quantity - idempotent)
DELETE /api/cart/items (remove)
DELETE /api/cart/clear-cart (clear all)
POST /api/cart/validate (check stock)
GET /api/cart/summary (totals)
Purpose: Build cart before checkout
```

### 5. Guest Cart (Pre-Login)

```
POST /api/guest-cart/init
GET /api/guest-cart?sessionId=...
POST /api/guest-cart/items
DELETE /api/guest-cart/items
DELETE /api/guest-cart/clear
Purpose: Persistent cart before login
Post-Login: POST /api/guest-cart/migrate (merge with user cart)
```

### 6. Coupon Application

```
POST /api/coupons/validate (before checkout, check validity)
POST /api/coupons/:orderId/apply (after order creation)
Input: { couponCode }
Output: { discountAmount, newTotal }
Discount Types: PERCENTAGE or FIXED amount
```

### 7. Checkout - Create Order

```
POST /orders (create order from cart - idempotent)
Input: { addressId }
Output: { orderId, status, totalAmount }
Process:
  - Validate cart
  - Create Order record
  - Create OrderItems (per seller)
  - Clear user cart
  - Return order details
```

### 8. Payment Processing

```
POST /orders/:orderId/pay (idempotent)
Output: { razorpayOrderId, amount, currency }
Purpose: Initiate Razorpay payment

POST /webhook (Razorpay callback - no auth)
Purpose: Handle payment success/failure
Update: Payment model with status
```

### 9. Order Tracking

```
GET /orders (list with filters, sorting, search)
Query: ?skip=...&limit=...&status=...&sortBy=...&order=...&search=...
GET /orders/:orderId (specific order)
PATCH /orders/:orderId/cancel (cancel if eligible)
Purpose: View order history with advanced filtering
```

### 10. Returns & Refunds

```
POST /api/returns/request (user initiates return)
Input: { orderItemId, reason, description }

GET /api/returns (view user's returns)
GET /api/returns/:returnId (specific return status)
PATCH /api/returns/:returnId/cancel (cancel return request)

Purpose: Request return, track refund status
```

### 11. User Profile

```
GET /api/user/profile
PATCH /api/user/profile
Input: { name, phone, avatar, ... }
Purpose: Update personal information
```

### 12. Address Management

```
GET /api/user/addresses
POST /api/user/addresses
Input: { label, street, city, state, zipCode, country, phone, isDefault }
PATCH /api/user/addresses/:addressId
DELETE /api/user/addresses/:addressId
GET /api/user/addresses/default
Purpose: Manage shipping addresses
```

### 13. Wishlist

```
GET /api/wishlist
POST /api/wishlist/add
Input: { productId }
POST /api/wishlist/remove
Input: { productId }
DELETE /api/wishlist/clear
GET /api/wishlist/check?productId=...
Purpose: Save favorites, quick checkout
```

### 14. Reviews

```
POST /api/reviews/product/:productId (create - isAuth)
PATCH /api/reviews/:reviewId (update own - isAuth)
DELETE /api/reviews/:reviewId (delete own - isAuth)
POST /api/reviews/:reviewId/helpful (mark helpful)
Purpose: Leave product feedback
```

---

## 🛠️ ADMIN FLOW - COMPLETE MANAGEMENT

### 1. Admin Dashboard

```
GET /api/analytics/dashboard
Output: { totalOrders, totalRevenue, totalCustomers, pendingOrders, avgOrderValue }

Purpose: KPIs overview
```

### 2. Analytics & Reports

```
GET /api/analytics/sales?startDate=...&endDate=...
GET /api/analytics/payments?startDate=...&endDate=...
GET /api/analytics/customers?startDate=...&endDate=...
GET /api/analytics/inventory
GET /api/analytics/orders/status?startDate=...&endDate=...
GET /api/analytics/coupons?startDate=...&endDate=...
GET /api/analytics/seller?startDate=...&endDate=...

Purpose: Deep business insights with date ranges
```

### 3. Product Management

```
POST /api/product/addproduct (create - file upload)
Input: { name, description, price, category, subCategory, sizes[], bestseller }
Files: image1, image2, image3, image4 (Cloudinary)

GET /api/product/admin/list
PUT /api/product/update/:id (update)
POST /api/product/remove/:id (delete)
PUT /api/product/update-stock/:id (update stock)
Input: { size, stockChange }

Purpose: CRUD operations, image management
```

### 4. Order Management

```
GET /api/admin/orders (seller's orders only - multi-vendor)
GET /api/admin/orders/:orderId

PATCH /api/admin/orders/order-items/:itemId/status
Input: { status: PROCESSING|SHIPPED|DELIVERED|CANCELLED }

PATCH /api/admin/orders/order-items/bulk/status
Input: { updates: [{ itemId, status }] }

Purpose: Update order status, bulk operations
```

### 5. Inventory Management

```
GET /api/admin/inventory/low-stock?threshold=10
Purpose: Stock alerts

POST /api/admin/inventory/bulk/json
Input: { inventory: [{ productId, size, totalStock }] }

POST /api/admin/inventory/bulk/csv
File: CSV (productId,size,totalStock)

Purpose: Bulk inventory updates
```

### 6. Coupon Management

```
POST /api/coupons/admin/create
Input: { code, discountType, discountValue, minOrderAmount, maxUses, maxUsesPerUser, startDate, expiryDate }

GET /api/coupons/admin/all?skip=...&limit=...
PATCH /api/coupons/admin/:couponId
PATCH /api/coupons/admin/:couponId/toggle
Input: { isActive }
DELETE /api/coupons/admin/:couponId

Purpose: Discount code management
```

### 7. Return/Refund Management

```
GET /api/returns/admin/all?skip=...&limit=...&status=...
GET /api/returns/admin/stats

PATCH /api/returns/admin/:returnId/approve
Input: { refundAmount }

PATCH /api/returns/admin/:returnId/reject
PATCH /api/returns/admin/:returnId/refund (process refund)
PATCH /api/returns/admin/:returnId/refund-failed

Purpose: Handle returns, approve/reject, process refunds
```

### 8. Review Moderation

```
GET /api/reviews/admin/all?skip=...&limit=...
PATCH /api/reviews/admin/:reviewId/visibility
Input: { isVisible }

POST /api/reviews/admin/:reviewId/respond
Input: { comment }

Purpose: Moderate reviews, respond to feedback
```

---

## 📋 COMPLETE ENDPOINT TABLE

| #                   | Endpoint                                       | Method | Auth  | Purpose                       | Request                                                          | Response                              |
| ------------------- | ---------------------------------------------- | ------ | ----- | ----------------------------- | ---------------------------------------------------------------- | ------------------------------------- |
| **AUTHENTICATION**  |                                                |        |       |                               |                                                                  |                                       |
| 1                   | `/api/auth/registration`                       | POST   | No    | User register                 | {name, email, password}                                          | {user, token}                         |
| 2                   | `/api/auth/login`                              | POST   | No    | User login                    | {email, password}                                                | {user, token}                         |
| 3                   | `/api/auth/verify-email`                       | POST   | No    | Verify OTP                    | {email, otp}                                                     | {verified}                            |
| 4                   | `/api/auth/adminregister`                      | POST   | No    | Admin register                | {name, email, password}                                          | {admin, token}                        |
| 5                   | `/api/auth/adminlogin`                         | POST   | No    | Admin login                   | {email, password}                                                | {admin, token}                        |
| 6                   | `/api/auth/user/logout`                        | GET    | User  | User logout                   | -                                                                | {message}                             |
| 7                   | `/api/auth/admin/logout`                       | GET    | Admin | Admin logout                  | -                                                                | {message}                             |
| 8                   | `/api/auth/request-password-reset`             | POST   | No    | Password reset request        | {email, role}                                                    | {message}                             |
| 9                   | `/api/auth/reset-password`                     | POST   | No    | Reset password                | {email, otp, newPassword, role}                                  | {message}                             |
| 10                  | `/api/auth/resend-otp`                         | POST   | No    | Resend OTP                    | {email, type, role}                                              | {message}                             |
| 11                  | `/api/auth/googlelogin`                        | POST   | No    | Google OAuth                  | {name, email}                                                    | {user, token}                         |
| **PRODUCTS**        |                                                |        |       |                               |                                                                  |                                       |
| 12                  | `/api/product/list`                            | GET    | Any   | List products (filtered)      | ?category=...&price=...&skip=...&limit=...                       | {products[], total}                   |
| 13                  | `/api/product/:id`                             | GET    | Any   | Get product details           | -                                                                | {product}                             |
| 14                  | `/api/product/addproduct`                      | POST   | Admin | Create product                | {name, description, price, category, subCategory, sizes}         | {product}                             |
| 15                  | `/api/product/admin/list`                      | GET    | Admin | Admin product list            | -                                                                | {products[]}                          |
| 16                  | `/api/product/update/:id`                      | PUT    | Admin | Update product                | {name, description, price, category, sizes}                      | {product}                             |
| 17                  | `/api/product/remove/:id`                      | POST   | Admin | Delete product                | -                                                                | {message}                             |
| 18                  | `/api/product/update-stock/:id`                | PUT    | Admin | Update stock                  | {size, stockChange}                                              | {product}                             |
| **REVIEWS**         |                                                |        |       |                               |                                                                  |                                       |
| 19                  | `/api/reviews/product/:productId`              | GET    | Any   | Get product reviews           | ?skip=...&limit=...&sortBy=...                                   | {reviews[], avgRating}                |
| 20                  | `/api/reviews/product/:productId`              | POST   | User  | Create review                 | {rating, title, comment}                                         | {review}                              |
| 21                  | `/api/reviews/:reviewId`                       | PATCH  | User  | Update review                 | {rating, title, comment}                                         | {review}                              |
| 22                  | `/api/reviews/:reviewId`                       | DELETE | User  | Delete review                 | -                                                                | {message}                             |
| 23                  | `/api/reviews/:reviewId/helpful`               | POST   | Any   | Mark helpful                  | -                                                                | {review}                              |
| 24                  | `/api/reviews/admin/all`                       | GET    | Admin | List all reviews              | ?skip=...&limit=...                                              | {reviews[], total}                    |
| 25                  | `/api/reviews/admin/:reviewId/visibility`      | PATCH  | Admin | Toggle visibility             | {isVisible}                                                      | {review}                              |
| 26                  | `/api/reviews/admin/:reviewId/respond`         | POST   | Admin | Respond to review             | {comment}                                                        | {review}                              |
| **RECOMMENDATIONS** |                                                |        |       |                               |                                                                  |                                       |
| 27                  | `/api/recommendations`                         | GET    | Any   | Recommended (bestsellers)     | ?limit=...                                                       | {products[]}                          |
| 28                  | `/api/recommendations/similar/:productId`      | GET    | Any   | Similar products              | ?limit=...                                                       | {products[]}                          |
| 29                  | `/api/recommendations/related/:productId`      | GET    | Any   | Related products              | ?limit=...                                                       | {products[]}                          |
| 30                  | `/api/recommendations/top-rated`               | GET    | Any   | Top rated                     | ?limit=...                                                       | {products[]}                          |
| 31                  | `/api/recommendations/trending`                | GET    | Any   | Trending                      | ?limit=...                                                       | {products[]}                          |
| 32                  | `/api/recommendations/you-may-like/:productId` | GET    | Any   | You may like                  | ?limit=...                                                       | {products[]}                          |
| 33                  | `/api/recommendations/personalized`            | GET    | User  | Personalized                  | ?limit=...                                                       | {products[]}                          |
| **CART (USER)**     |                                                |        |       |                               |                                                                  |                                       |
| 34                  | `/api/cart`                                    | GET    | User  | Get cart                      | -                                                                | {items[], total, count}               |
| 35                  | `/api/cart/summary`                            | GET    | User  | Cart summary                  | -                                                                | {subtotal, tax, total}                |
| 36                  | `/api/cart/items`                              | POST   | User  | Add item (idempotent)         | {productId, size, quantity, price, name, image}                  | {cart}                                |
| 37                  | `/api/cart/items`                              | PATCH  | User  | Update item (idempotent)      | {productId, size, quantity}                                      | {cart}                                |
| 38                  | `/api/cart/items`                              | DELETE | User  | Remove item                   | {productId, size}                                                | {cart}                                |
| 39                  | `/api/cart/clear-cart`                         | DELETE | User  | Clear cart                    | -                                                                | {message}                             |
| 40                  | `/api/cart/validate`                           | POST   | User  | Validate cart                 | -                                                                | {valid, errors[]}                     |
| 41                  | `/api/cart/checkout`                           | POST   | User  | Create order (idempotent)     | -                                                                | {order}                               |
| 42                  | `/api/cart/sync`                               | POST   | User  | Sync prices                   | -                                                                | {cart}                                |
| 43                  | `/api/cart/merge`                              | POST   | User  | Merge guest cart              | {guestCart}                                                      | {cart}                                |
| **CART (GUEST)**    |                                                |        |       |                               |                                                                  |                                       |
| 44                  | `/api/guest-cart/init`                         | POST   | No    | Initialize guest cart         | {sessionId}                                                      | {guestCart}                           |
| 45                  | `/api/guest-cart`                              | GET    | No    | Get guest cart                | ?sessionId=...                                                   | {guestCart}                           |
| 46                  | `/api/guest-cart/items`                        | POST   | No    | Add item to guest             | ?sessionId=...&{productId, size, quantity}                       | {guestCart}                           |
| 47                  | `/api/guest-cart/items`                        | DELETE | No    | Remove from guest             | ?sessionId=...&{productId, size}                                 | {guestCart}                           |
| 48                  | `/api/guest-cart/clear`                        | DELETE | No    | Clear guest                   | ?sessionId=...                                                   | {guestCart}                           |
| 49                  | `/api/guest-cart/migrate`                      | POST   | User  | Migrate to user               | {sessionId}                                                      | {items[], message}                    |
| **ORDERS (USER)**   |                                                |        |       |                               |                                                                  |                                       |
| 50                  | `/orders`                                      | POST   | User  | Create order (idempotent)     | {addressId}                                                      | {order}                               |
| 51                  | `/orders`                                      | GET    | User  | List orders (filters)         | ?skip=...&limit=...&status=...&sortBy=...                        | {orders[], total, pages}              |
| 52                  | `/orders/:orderId`                             | GET    | User  | Get order details             | -                                                                | {order}                               |
| 53                  | `/orders/:orderId/cancel`                      | PATCH  | User  | Cancel order                  | -                                                                | {order}                               |
| **PAYMENT**         |                                                |        |       |                               |                                                                  |                                       |
| 54                  | `/orders/:orderId/pay`                         | POST   | User  | Initiate payment (idempotent) | -                                                                | {razorpayOrderId, amount}             |
| 55                  | `/payments/:orderId`                           | GET    | User  | Get payment status            | -                                                                | {payment}                             |
| 56                  | `/webhook`                                     | POST   | No    | Razorpay webhook              | {razorpay_signature}                                             | {acknowledged}                        |
| **COUPONS**         |                                                |        |       |                               |                                                                  |                                       |
| 57                  | `/api/coupons/validate`                        | POST   | User  | Validate coupon               | {couponCode, orderAmount}                                        | {coupon, discount}                    |
| 58                  | `/api/coupons/:code`                           | GET    | Any   | Get coupon info               | -                                                                | {coupon}                              |
| 59                  | `/api/coupons/:orderId/apply`                  | POST   | User  | Apply coupon                  | {couponCode}                                                     | {discount, newTotal}                  |
| 60                  | `/api/coupons/admin/create`                    | POST   | Admin | Create coupon                 | {code, discountType, discountValue, ...}                         | {coupon}                              |
| 61                  | `/api/coupons/admin/all`                       | GET    | Admin | List coupons                  | ?skip=...&limit=...                                              | {coupons[], total}                    |
| 62                  | `/api/coupons/admin/:couponId`                 | PATCH  | Admin | Update coupon                 | {code, discountValue, ...}                                       | {coupon}                              |
| 63                  | `/api/coupons/admin/:couponId/toggle`          | PATCH  | Admin | Toggle status                 | {isActive}                                                       | {coupon}                              |
| 64                  | `/api/coupons/admin/:couponId`                 | DELETE | Admin | Delete coupon                 | -                                                                | {message}                             |
| **RETURNS**         |                                                |        |       |                               |                                                                  |                                       |
| 65                  | `/api/returns/request`                         | POST   | User  | Request return                | {orderItemId, reason, description}                               | {returnRequest}                       |
| 66                  | `/api/returns`                                 | GET    | User  | Get user returns              | -                                                                | {returns[]}                           |
| 67                  | `/api/returns/:returnId`                       | GET    | User  | Get return details            | -                                                                | {returnRequest}                       |
| 68                  | `/api/returns/:returnId/cancel`                | PATCH  | User  | Cancel return                 | -                                                                | {returnRequest}                       |
| 69                  | `/api/returns/admin/all`                       | GET    | Admin | List returns                  | ?skip=...&limit=...&status=...                                   | {returns[], total}                    |
| 70                  | `/api/returns/admin/:returnId/approve`         | PATCH  | Admin | Approve return                | {refundAmount}                                                   | {returnRequest}                       |
| 71                  | `/api/returns/admin/:returnId/reject`          | PATCH  | Admin | Reject return                 | -                                                                | {returnRequest}                       |
| 72                  | `/api/returns/admin/:returnId/refund`          | PATCH  | Admin | Process refund                | -                                                                | {returnRequest}                       |
| 73                  | `/api/returns/admin/:returnId/refund-failed`   | PATCH  | Admin | Refund failed                 | -                                                                | {returnRequest}                       |
| 74                  | `/api/returns/admin/stats`                     | GET    | Admin | Return statistics             | -                                                                | {stats}                               |
| **USER PROFILE**    |                                                |        |       |                               |                                                                  |                                       |
| 75                  | `/api/user/profile`                            | GET    | User  | Get profile                   | -                                                                | {user}                                |
| 76                  | `/api/user/profile`                            | PATCH  | User  | Update profile                | {name, phone, avatar}                                            | {user}                                |
| 77                  | `/api/user/addresses`                          | GET    | User  | List addresses                | -                                                                | {addresses[]}                         |
| 78                  | `/api/user/addresses`                          | POST   | User  | Create address                | {label, street, city, state, zipCode, country, phone, isDefault} | {address}                             |
| 79                  | `/api/user/addresses/:addressId`               | PATCH  | User  | Update address                | {label, street, ...}                                             | {address}                             |
| 80                  | `/api/user/addresses/:addressId`               | DELETE | User  | Delete address                | -                                                                | {message}                             |
| 81                  | `/api/user/addresses/default`                  | GET    | User  | Get default address           | -                                                                | {address}                             |
| **WISHLIST**        |                                                |        |       |                               |                                                                  |                                       |
| 82                  | `/api/wishlist`                                | GET    | User  | Get wishlist                  | -                                                                | {items[], userId}                     |
| 83                  | `/api/wishlist/add`                            | POST   | User  | Add to wishlist               | {productId}                                                      | {wishlist}                            |
| 84                  | `/api/wishlist/remove`                         | POST   | User  | Remove from wishlist          | {productId}                                                      | {wishlist}                            |
| 85                  | `/api/wishlist/check`                          | GET    | User  | Check if in wishlist          | ?productId=...                                                   | {inWishlist}                          |
| 86                  | `/api/wishlist/clear`                          | DELETE | User  | Clear wishlist                | -                                                                | {wishlist}                            |
| **ADMIN ORDERS**    |                                                |        |       |                               |                                                                  |                                       |
| 87                  | `/api/admin/orders`                            | GET    | Admin | Get seller orders             | -                                                                | {orders[]}                            |
| 88                  | `/api/admin/orders/:orderId`                   | GET    | Admin | Get order details             | -                                                                | {order}                               |
| 89                  | `/api/admin/orders/order-items/:itemId/status` | PATCH  | Admin | Update item status            | {status}                                                         | {result}                              |
| 90                  | `/api/admin/orders/order-items/bulk/status`    | PATCH  | Admin | Bulk update status            | {updates[]}                                                      | {result}                              |
| **ADMIN INVENTORY** |                                                |        |       |                               |                                                                  |                                       |
| 91                  | `/api/admin/inventory/low-stock`               | GET    | Admin | Low stock items               | ?threshold=10                                                    | {products[]}                          |
| 92                  | `/api/admin/inventory/bulk/json`               | POST   | Admin | Bulk update (JSON)            | {inventory[]}                                                    | {result}                              |
| 93                  | `/api/admin/inventory/bulk/csv`                | POST   | Admin | Bulk update (CSV)             | File: CSV                                                        | {result}                              |
| **ANALYTICS**       |                                                |        |       |                               |                                                                  |                                       |
| 94                  | `/api/analytics/dashboard`                     | GET    | Admin | Dashboard KPIs                | -                                                                | {totalOrders, revenue, customers}     |
| 95                  | `/api/analytics/sales`                         | GET    | Admin | Sales analytics               | ?startDate=...&endDate=...                                       | {dailySales[], topProducts[]}         |
| 96                  | `/api/analytics/payments`                      | GET    | Admin | Payment analytics             | ?startDate=...&endDate=...                                       | {byStatus[], byProvider[], failed}    |
| 97                  | `/api/analytics/customers`                     | GET    | Admin | Customer analytics            | ?startDate=...&endDate=...                                       | {new, repeat, topCustomers[]}         |
| 98                  | `/api/analytics/inventory`                     | GET    | Admin | Inventory analytics           | -                                                                | {lowStock, total, mostReserved[]}     |
| 99                  | `/api/analytics/orders/status`                 | GET    | Admin | Order distribution            | ?startDate=...&endDate=...                                       | {distribution[]}                      |
| 100                 | `/api/analytics/coupons`                       | GET    | Admin | Coupon analytics              | ?startDate=...&endDate=...                                       | {topCoupons[], totalDiscount}         |
| 101                 | `/api/analytics/seller`                        | GET    | Admin | Seller analytics              | ?startDate=...&endDate=...                                       | {totalOrders, revenue, topProducts[]} |
| **HEALTH CHECK**    |                                                |        |       |                               |                                                                  |                                       |
| 102                 | `/api/healthCheck`                             | GET    | No    | Server health                 | -                                                                | {status: ok}                          |

---

## 🔑 KEY DATA MODELS

### User Model (MongoDB)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String (Cloudinary URL),
  role: "user",
  emailVerified: Boolean,
  isActive: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Product Model (MongoDB)

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Float,
  category: String,
  subCategory: String,
  images: [String] (Cloudinary URLs),
  sizes: [String] (XS, S, M, L, XL, XXL),
  ratings: Float (aggregated),
  reviewCount: Number,
  seller: String (admin email - multi-vendor),
  bestseller: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Order Model (PostgreSQL)

```javascript
{
  id: UUID,
  userId: String (MongoDB User._id),
  status: "PENDING" | "PARTIALLY_SHIPPED" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED",
  totalAmount: Float,
  addressId: UUID,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### OrderItem Model (PostgreSQL)

```javascript
{
  id: UUID,
  orderId: UUID,
  productId: String (MongoDB Product._id),
  size: String,
  sellerId: String (admin email - multi-vendor),
  quantity: Int,
  price: Float,
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## 🔄 CRITICAL FLOWS

### Flow 1: User Registration → Login

```
1. POST /api/auth/registration
   - Validate unique email
   - Hash password
   - Create User in MongoDB
   - Generate JWT (userId)
   - Return token in httpOnly cookie

2. POST /api/auth/verify-email
   - Check OTP (sent via email)
   - Update User.emailVerified = true

3. POST /api/auth/login
   - Find user by email
   - Compare password with hash
   - Generate fresh token
   - Return token
```

### Flow 2: Browse → Add to Cart → Checkout

```
1. GET /api/product/list (browse)
2. GET /api/product/:id (view details)
3. POST /api/cart/items (add to cart - idempotent)
4. GET /api/cart (review cart)
5. POST /api/coupons/validate (validate coupon if user has)
6. POST /orders (create order from cart)
   - Validates items are in stock
   - Creates Order + OrderItems (per seller)
   - Clears user's cart
   - Returns orderId for payment
7. POST /orders/:orderId/pay (initiate payment)
   - Creates Payment record
   - Returns Razorpay order details
8. /webhook (Razorpay confirms payment)
   - Updates Payment.status to "success"
   - Kafka event triggers inventory update
```

### Flow 3: Multi-Vendor Order Processing

```
1. Single Order can have items from multiple sellers
   - Example: Order123 has 2 items from Seller A, 1 item from Seller B

2. Each OrderItem has separate status tracking
   - Seller A manages OrderItems[0] and OrderItems[1]
   - Seller B manages OrderItems[2]

3. PATCH /api/admin/orders/order-items/:itemId/status
   - Each seller updates only their items
   - Derived order status = check all items
   - All shipped? → Order.status = SHIPPED

4. Analytics shows seller-specific metrics
   - GET /api/analytics/seller shows seller's orders only
```

### Flow 4: Return/Refund Management

```
1. POST /api/returns/request (User initiates)
   - Sets status = REQUESTED

2. GET /api/returns/admin/all (Admin views pending)

3. PATCH /api/returns/admin/:returnId/approve (Admin approval)
   - Sets status = APPROVED
   - Sets refundAmount
   - Prepares for refund processing

4. PATCH /api/returns/admin/:returnId/refund (Process refund)
   - Sets status = REFUNDED
   - Could trigger actual payment refund
   - Kafka event for notifications

5. GET /api/returns (User tracks refund status)
```

---

## ⚠️ IMPORTANT ARCHITECTURAL NOTES

### 1. Multi-Vendor System

- **NOT A MARKETPLACE** - All sellers are admins with same platform
- Each seller owns products and manages their OrderItems
- Orders CAN contain items from multiple sellers
- Analytics can be filtered by seller
- Future: Convert to full marketplace

### 2. Idempotency Protection

Critical endpoints use idempotency keys:

- `POST /orders` (create order)
- `POST /orders/:orderId/pay` (payment)
- `POST /api/cart/items` (add to cart)
- Prevents duplicate charges/orders on network retries

### 3. Hybrid Database Strategy

- **PostgreSQL:** Transactional consistency (orders, payments)
- **MongoDB:** Flexible schemas (products, users, reviews)
- **Redis:** High-speed caching (cart, sessions, locks)
- Trade-off: More complex to maintain

### 4. Event-Driven Architecture

Kafka producers emit events:

- `order.created` → inventory-consumer (reduce stock)
- `payment.completed` → order-consumer (update status)
- `payment.failed` → payment-consumer (handle retry)
- `order.shipped` → mail-consumer (send email)

### 5. JWT Token Management

- User token has only `userId` (simple)
- Admin token has `email` + `adminId` (can have multiple admins per seller)
- httpOnly cookie + localStorage for resilience
- Logout adds token to Redis blacklist (no database queries needed)

---

## 🚨 IDENTIFIED GAPS & ASSUMPTIONS

### Gaps (Could be added):

1. ❌ **Rate limiting** - Not explicitly implemented (should be added to middleware)
2. ❌ **Email notifications** - Infrastructure ready (SendGrid configured) but implementation unclear
3. ❌ **Real-time updates** - No WebSocket/Socket.io for live order tracking
4. ❌ **Search optimization** - Elasticsearch configured but unclear if integrated
5. ❌ **Multi-language support** - Not visible in schema

### Assumptions (Verified from code):

1. ✅ **JWT in cookies** - `isAuth` middleware expects token in cookies
2. ✅ **Image hosting on Cloudinary** - File uploads go through Cloudinary
3. ✅ **Razorpay webhook signature verification** - Required for payment webhook
4. ✅ **OTP via email** - Authentication flow sends OTP (no SMS)
5. ✅ **Size-based inventory** - Every product has sizes (XS-XXL)
6. ✅ **Seller = Admin** - Sellers are created as admins with admin role

---

## 📋 AUTH & MIDDLEWARE STRATEGY

### Authentication Middleware

```javascript
isAuth; // Verifies user token (userId)
isAuthAdmin; // Verifies admin token (email + adminId)
```

### Validation

```javascript
authValidations; // Email format, password strength
productValidations; // Name, price, category required
cartValidations; // ProductId, size, quantity validation
```

### Error Handling

```javascript
ApiError(statusCode, message, errors, module);
ApiResponse(statusCode, data, message);
```

### Idempotency

```javascript
checkIdempotency; // Middleware that checks IdempotencyKey
// Returns cached response if already processed
```

---

## 🎯 SUMMARY FOR FRONTEND

### What the Frontend Needs to Know:

1. **Two auth systems:** User (simple) vs Admin (complex with seller logic)
2. **Token handling:** Store JWT in localStorage + cookies handled by backend
3. **Multi-vendor:** Single order can have items from different sellers
4. **Idempotency:** Use Idempotency-Key header on POST requests
5. **Roles:** User can be customer OR admin (not both simultaneously)
6. **Guest experience:** Full cart functionality without login (session-based)
7. **Analytics:** All date-filtered (startDate/endDate query params)
8. **Inventory:** Size-specific (product has multiple sizes)

---

## ✅ VERIFICATION CHECKLIST

### Backend Status ✅

- [x] All 105+ endpoints documented
- [x] Authentication flows clear
- [x] Database models well-structured
- [x] Multi-vendor system understood
- [x] Idempotency protection in place
- [x] Error handling strategy defined
- [x] Middleware chain clear
- [x] Token management understood

### Ready for Frontend Architecture ✅

---

**Document Status:** COMPLETE  
**Date:** April 26, 2026  
**Next Step:** Proceed to STEP 2: Flow Design
