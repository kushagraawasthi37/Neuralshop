# NeuralShop — Complete Architecture Reference



## Project Overview

NeuralShop is a luxury e-commerce platform with multi-vendor order management, Razorpay payments, Elasticsearch search, Kafka event-driven processing, and a React SPA frontend with a dedicated admin seller dashboard.

```
NeuralShop/
├── backend/   Express.js 5 + Prisma (PostgreSQL) + Mongoose (MongoDB) + Redis + Kafka
├── frontend/  React 19 + Vite + Zustand + React Query + Tailwind CSS
└── ARCHITECTURE.md  ← this file
```

---

## Backend Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js / Express.js 5.1 |
| Primary DB | PostgreSQL via Prisma ORM |
| Secondary DB | MongoDB via Mongoose |
| Cache / Locks | Redis (ioredis) |
| Search | Elasticsearch |
| Messaging | Kafka (kafkajs) |
| Auth | JWT (httpOnly cookies: `userToken`, `adminToken`) |
| File Upload | Cloudinary + Multer |
| Email | SendGrid |
| Payments | Razorpay |

### Entry Points
- `backend/src/server.js` — bootstraps app, loads env
- `backend/src/app.js` — wires middleware + routes
- `backend/src/routes/index.js` — mounts all route prefixes

### Database Models
**Prisma (PostgreSQL):** `Address`, `Order`, `OrderItem`, `Payment`, `Inventory`, `Coupon`, `Return`, `IdempotencyKey`

**Mongoose (MongoDB):** `User` (auth.model.js), `Admin` (same file), `Product` (product.model.js), `Review` (review.model.js), `Wishlist` (wishlist.model.js), `Cart` (cart.model.js)

---

## Backend Route Map

All routes are mounted in `backend/src/routes/index.js`.

### AUTH — mounted at `/api/auth`
```
POST   /api/auth/registration          user signup → sends OTP email
POST   /api/auth/login                 user login → sets userToken cookie
GET    /api/auth/user/logout           [isAuth] clears userToken cookie
POST   /api/auth/adminregister         admin/seller signup
POST   /api/auth/adminlogin            admin login → sets adminToken cookie
GET    /api/auth/admin/logout          [isAuthAdmin] clears adminToken cookie
POST   /api/auth/verify-email          verify user email with OTP
POST   /api/auth/verify-admin-email    verify admin email with OTP
POST   /api/auth/resend-otp            resend OTP (body: { email, type, role })
POST   /api/auth/request-password-reset  forgot password
POST   /api/auth/reset-password        set new password
POST   /api/auth/verify-reset-otp      verify reset OTP
POST   /api/auth/googlelogin           Google OAuth login
```

### PRODUCT — mounted at `/api/product`
```
POST   /api/product/addproduct         [isAuthAdmin] multipart form — create product
                                        fields: name, category, price, originalPrice, description,
                                                isActive, sizes (JSON), image1..image4 (files)
GET    /api/product/admin/list         [isAuthAdmin] admin product list
POST   /api/product/remove/:id         [isAuthAdmin] delete product
PUT    /api/product/update/:id         [isAuthAdmin] multipart form — update product
                                        same fields as addproduct (images optional)
PUT    /api/product/update-stock/:id   [isAuthAdmin] update product stock field in MongoDB
GET    /api/product/browse/all         public paginated browse (query: page, limit, category)
GET    /api/product/list               public filtered list (query: search, sort, category, priceMax, skip, limit)
GET    /api/product/:id                public single product detail
```

### REVIEWS — mounted at `/api/reviews`
```
GET    /api/reviews/product/:productId           public — get reviews for product
POST   /api/reviews/product/:productId           [isAuth] create review (body: { rating, comment })
PATCH  /api/reviews/:reviewId                    [isAuth] update own review
DELETE /api/reviews/:reviewId                    [isAuth] delete own review
POST   /api/reviews/:reviewId/helpful            mark review helpful (no auth)
GET    /api/reviews/admin/all                    [isAuthAdmin] all reviews with pagination
PATCH  /api/reviews/admin/:reviewId/visibility   [isAuthAdmin] toggle review visibility
DELETE /api/reviews/admin/:reviewId              [isAuthAdmin] admin delete review
POST   /api/reviews/admin/:reviewId/respond      [isAuthAdmin] admin respond to review
```

### RECOMMENDATIONS — mounted at `/api/recommendations`
```
GET    /api/recommendations/similar/:productId   public — products in same category
GET    /api/recommendations/related/:productId   public — related products
GET    /api/recommendations/top-rated            public — top rated products
GET    /api/recommendations/trending             public — trending products
GET    /api/recommendations/you-may-like/:productId  public — "you may also like"
GET    /api/recommendations                      public — bestsellers/general
GET    /api/recommendations/personalized         [isAuth] personalized for user
```

### CART — mounted at `/api/cart`
```
GET    /api/cart                       [isAuth] get user cart
GET    /api/cart/summary               [isAuth] cart total/count summary
POST   /api/cart/items                 [isAuth+idempotent] add item
                                        body: { productId, quantity, size, priceAtAdd, name, image }
PATCH  /api/cart/items                 [isAuth+idempotent] update item quantity
                                        body: { productId, quantity, size }
DELETE /api/cart/items                 [isAuth] remove item (body: { productId, size })
DELETE /api/cart/clear-cart            [isAuth] clear entire cart
POST   /api/cart/validate              [isAuth] validate cart items/prices
POST   /api/cart/checkout              [isAuth+idempotent] create order from cart
                                        body: { addressId, couponCode? }
POST   /api/cart/merge                 [isAuth] merge guest cart (localStorage) into user cart
                                        body: { guestCart: [ { productId, quantity, size, priceAtAdd, name, image } ] }
```

### GUEST CART — mounted at `/api/guest-cart`
> **Note:** Frontend uses localStorage for guest cart, not these server routes. Only `/api/cart/merge` is used at login.
```
POST   /api/guest-cart/init            initialize server-side guest cart session
GET    /api/guest-cart                 get guest cart
POST   /api/guest-cart/items           add item to guest cart
DELETE /api/guest-cart/items           remove item
DELETE /api/guest-cart/clear           clear guest cart
DELETE /api/guest-cart/                delete guest cart
POST   /api/guest-cart/migrate         [isAuth] migrate server guest cart to user cart
```

### ORDERS — mounted at `/orders` (no /api prefix!)
```
POST   /orders/orders                  [isAuth+idempotent] create order from cart
GET    /orders/orders                  [isAuth] list user's orders
GET    /orders/orders/:orderId         [isAuth] get single order detail
PATCH  /orders/orders/:orderId/cancel  [isAuth] cancel order
```

### ADMIN ORDERS — mounted at `/api/admin/orders`
```
GET    /api/admin/orders               [isAuthAdmin] seller's order list
GET    /api/admin/orders/:orderId      [isAuthAdmin] order detail
PATCH  /api/admin/orders/order-items/:itemId/status  [isAuthAdmin] update per-item status
PATCH  /api/admin/orders/bulk/status   [isAuthAdmin] bulk status update
```

### RETURNS — mounted at `/api/returns`
```
GET    /api/returns/admin/stats        [isAuthAdmin] return statistics
GET    /api/returns/admin/all          [isAuthAdmin] all return requests
PATCH  /api/returns/admin/:returnId/approve     [isAuthAdmin] approve return
PATCH  /api/returns/admin/:returnId/reject      [isAuthAdmin] reject return (body: { reason })
PATCH  /api/returns/admin/:returnId/refund      [isAuthAdmin] process refund
PATCH  /api/returns/admin/:returnId/refund-failed  [isAuthAdmin] mark refund failed
POST   /api/returns/request            [isAuth] user requests return
GET    /api/returns                    [isAuth] user's return list
GET    /api/returns/:returnId          [isAuth] single return detail
PATCH  /api/returns/:returnId/cancel   [isAuth] cancel return
```

### PAYMENTS — mounted at root (no prefix)
```
POST   /orders/:orderId/pay            [isAuth+idempotent] initiate Razorpay payment
GET    /payments/:orderId              [isAuth] get payment status
POST   /webhook                        Razorpay webhook callback (no auth, idempotent)
```

### COUPONS — mounted at `/api/coupons`
```
POST   /api/coupons/validate           [isAuth] validate coupon (body: { couponCode, orderAmount })
GET    /api/coupons/:code              public — get coupon info
POST   /api/coupons/:orderId/apply     [isAuth] apply coupon to existing order
POST   /api/coupons/admin/create       [isAuthAdmin] create coupon
GET    /api/coupons/admin/all          [isAuthAdmin] list all coupons
PATCH  /api/coupons/admin/:couponId    [isAuthAdmin] update coupon
PATCH  /api/coupons/admin/:couponId/toggle  [isAuthAdmin] toggle active/inactive
DELETE /api/coupons/admin/:couponId    [isAuthAdmin] delete coupon
```

### INVENTORY — mounted at `/api/admin/inventory`
```
GET    /api/admin/inventory/low-stock        [isAuthAdmin] low stock products (query: threshold)
POST   /api/admin/inventory/bulk/json        [isAuthAdmin] bulk update from JSON array
POST   /api/admin/inventory/bulk/csv         [isAuthAdmin] bulk update from CSV file
PATCH  /api/admin/inventory/:productId       [isAuthAdmin] manually update stock
GET    /api/admin/inventory/:productId       [isAuthAdmin] get inventory for specific product
GET    /api/admin/inventory                  [isAuthAdmin] get all inventory
```

### USER — mounted at `/api/user`
```
GET    /api/user/profile               [isAuth] get user profile
PATCH  /api/user/profile               [isAuth] update user profile
POST   /api/user/getcurrentuser        [isAuth] legacy — get current user
POST   /api/user/getcurrentadmin       [isAuthAdmin] legacy — get current admin
GET    /api/user/addresses             [isAuth] list addresses
POST   /api/user/addresses             [isAuth] create address
PATCH  /api/user/addresses/:addressId  [isAuth] update address
DELETE /api/user/addresses/:addressId  [isAuth] delete address
GET    /api/user/addresses/default     [isAuth] get default address
```

### ADMIN PROFILE — mounted at `/api/admin`
> Added in fix: profile management routes for admin/seller
```
GET    /api/admin/profile              [isAuthAdmin] get admin profile
PATCH  /api/admin/profile              [isAuthAdmin] update admin profile (body: { name, businessName })
PATCH  /api/admin/change-password      [isAuthAdmin] change password (body: { currentPassword, newPassword })
```

### WISHLIST — mounted at `/api/wishlist`
```
GET    /api/wishlist                   [isAuth] get wishlist
POST   /api/wishlist/add               [isAuth] add product (body: { productId })
POST   /api/wishlist/remove            [isAuth] remove product (body: { productId })
GET    /api/wishlist/check             [isAuth] check if in wishlist (query: productId)
DELETE /api/wishlist/clear             [isAuth] clear entire wishlist
```

### ANALYTICS — mounted at `/api/analytics`
All require `[isAuthAdmin]`.
```
GET    /api/analytics/dashboard        overall dashboard stats
GET    /api/analytics/sales            sales over time (query: period)
GET    /api/analytics/payments         payment analytics
GET    /api/analytics/customers        customer analytics
GET    /api/analytics/inventory        inventory analytics
GET    /api/analytics/orders/status    order status distribution
GET    /api/analytics/coupons          coupon usage analytics
GET    /api/analytics/seller           seller-specific analytics
```

### HEALTH CHECK
```
GET    /api/healthCheck                server health (no auth)
```

---

## Frontend Architecture

### Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Routing | react-router-dom 7 |
| State | Zustand 5 |
| Data Fetching | @tanstack/react-query 5 |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Styling | Tailwind CSS 4 + inline styles |
| HTTP | axios 1 |

### Axios Instances
- `frontend/src/api/axios.js` — base URL `/api`, attaches `userToken`/`adminToken` cookie automatically
- `frontend/src/api/rootAxios.js` — base URL `/`, for routes mounted at root (`/orders`, `/payments`)

### Frontend Route Map

| Path | Component | Auth |
|------|-----------|------|
| `/` | LandingPage | public |
| `/products` | ProductsPage | public |
| `/product/:id` | ProductDetailPage | public |
| `/search` | SearchPage | public |
| `/collections` | CollectionPage | public |
| `/about` | AboutPage | public |
| `/login` | LoginPage | public |
| `/register` | RegisterPage | public |
| `/verify-email` | VerifyEmailPage | public |
| `/forgot-password` | ForgotPasswordPage | public |
| `/reset-password` | ResetPasswordPage | public |
| `/new-password` | NewPasswordPage | public |
| `/admin/login` | AdminLoginPage | public |
| `/admin/register` | AdminRegisterPage | public |
| `/logout` | LogoutPage | public |
| `/logged-out` | LoggedOutPage | public |
| `/cart` | CartPage | public |
| `/checkout` | CheckoutPage | public |
| `/order-confirmation` | OrderConfirmationPage | public |
| `/orders/:orderId/track` | OrderTrackingPage | user |
| `/account/profile` | ProfilePage | user |
| `/account/orders` | OrderHistoryPage | user |
| `/account/wishlist` | WishlistPage | user |
| `/account/returns` | ReturnsPage | user |
| `/admin/dashboard` | AdminDashboardPage (panels) | admin |

### State Stores (Zustand)

**`authStore.js`** — `{ user, token, role, pendingEmail, pendingRole, isLoggedIn, setAuth, setPendingEmail, setPendingRole, logout }`

**`cartStore.js`** — `{ cart, loading, error, fetchCart, addItem, updateItem, removeItem, clearCart, getItemCount, getTotal }`

**`guestCartStore.js`** — localStorage-backed `{ items, addItem, removeItem, updateItem, clear }`. On login, items are sent to `/api/cart/merge`.

---

## Frontend API Files

### `frontend/src/api/auth.js`
Maps to `/api/auth/*`. All auth flows: register, login, logout, verify-email, resend-otp, forgot-password, reset-password, google-login.

### `frontend/src/api/products.js`
```javascript
productApi.list(params)          // GET /product/list
productApi.browse(params)        // GET /product/browse/all
productApi.getById(id)           // GET /product/:id
productApi.trending(params)      // GET /recommendations/trending
productApi.topRated(params)      // GET /recommendations/top-rated
productApi.recommended(params)   // GET /recommendations
productApi.similar(id)           // GET /recommendations/similar/:id
productApi.related(id)           // GET /recommendations/related/:id
productApi.youMayLike(id)        // GET /recommendations/you-may-like/:id  ← added
productApi.personalized()        // GET /recommendations/personalized

reviewApi.submit(productId, data)  // POST /reviews/product/:id
reviewApi.update(reviewId, data)   // PATCH /reviews/:reviewId            ← added
reviewApi.delete(reviewId)         // DELETE /reviews/:reviewId           ← added
```

### `frontend/src/api/cart.js`
```javascript
cartApi.get()                    // GET /cart
cartApi.summary()                // GET /cart/summary
cartApi.addItem(...)             // POST /cart/items (idempotent)
cartApi.updateItem(...)          // PATCH /cart/items (idempotent)
cartApi.removeItem(...)          // DELETE /cart/items
cartApi.clear()                  // DELETE /cart/clear-cart
cartApi.merge(guestCart)         // POST /cart/merge
cartApi.validate()               // POST /cart/validate
cartApi.checkout(addressId, couponCode?)  // POST /cart/checkout (idempotent)
```

### `frontend/src/api/orders.js`
```javascript
ordersApi.create(body)           // POST /orders/orders (idempotent, rootAxios)
ordersApi.list(params)           // GET /orders/orders (rootAxios)
ordersApi.get(orderId)           // GET /orders/orders/:id (rootAxios)
ordersApi.cancel(orderId)        // PATCH /orders/orders/:id/cancel (rootAxios)
ordersApi.pay(orderId)           // POST /orders/:id/pay (idempotent, rootAxios)
ordersApi.getPayment(orderId)    // GET /payments/:id (rootAxios)

couponsApi.validate(code, amount)        // POST /coupons/validate
couponsApi.getByCode(code)              // GET /coupons/:code
couponsApi.apply(orderId, couponCode)   // POST /coupons/:orderId/apply  ← added
```

### `frontend/src/api/user.js`
```javascript
userApi.getProfile()             // GET /user/profile
userApi.updateProfile(data)      // PATCH /user/profile
userApi.getAddresses()           // GET /user/addresses
userApi.getDefaultAddress()      // GET /user/addresses/default
userApi.createAddress(data)      // POST /user/addresses
userApi.updateAddress(id, data)  // PATCH /user/addresses/:id
userApi.deleteAddress(id)        // DELETE /user/addresses/:id

wishlistApi.get()                // GET /wishlist
wishlistApi.add(productId)       // POST /wishlist/add
wishlistApi.remove(productId)    // POST /wishlist/remove
wishlistApi.check(productId)     // GET /wishlist/check
wishlistApi.clear()              // DELETE /wishlist/clear

returnsApi.request(data)         // POST /returns/request
returnsApi.list()                // GET /returns
returnsApi.get(returnId)         // GET /returns/:returnId
returnsApi.cancel(returnId)      // PATCH /returns/:returnId/cancel
```

### `frontend/src/api/admin.js`
```javascript
analyticsApi.*                   // All 8 GET /analytics/* endpoints

adminOrdersApi.list()            // GET /admin/orders
adminOrdersApi.get(orderId)      // GET /admin/orders/:orderId
adminOrdersApi.updateItemStatus(itemId, status)  // PATCH /admin/orders/order-items/:id/status
adminOrdersApi.bulkUpdateStatus(updates)         // PATCH /admin/orders/bulk/status

adminInventoryApi.getAll()       // GET /admin/inventory
adminInventoryApi.getById(productId)  // GET /admin/inventory/:productId  ← added
adminInventoryApi.getLowStock(threshold)  // GET /admin/inventory/low-stock
adminInventoryApi.update(productId, totalStock, reason)  // PATCH /admin/inventory/:productId
adminInventoryApi.importCsv(formData)  // POST /admin/inventory/bulk/csv
adminInventoryApi.importJson(inventory)  // POST /admin/inventory/bulk/json

adminCouponsApi.list()           // GET /coupons/admin/all
adminCouponsApi.create(data)     // POST /coupons/admin/create
adminCouponsApi.update(id, data) // PATCH /coupons/admin/:id
adminCouponsApi.toggle(id)       // PATCH /coupons/admin/:id/toggle
adminCouponsApi.delete(id)       // DELETE /coupons/admin/:id

adminReturnsApi.list()           // GET /returns/admin/all
adminReturnsApi.stats()          // GET /returns/admin/stats
adminReturnsApi.approve(id)      // PATCH /returns/admin/:id/approve
adminReturnsApi.reject(id, reason)  // PATCH /returns/admin/:id/reject
adminReturnsApi.processRefund(id)   // PATCH /returns/admin/:id/refund
adminReturnsApi.markRefundFailed(id)  // PATCH /returns/admin/:id/refund-failed  ← added

adminReviewsApi.list(params)     // GET /reviews/admin/all
adminReviewsApi.toggleVisibility(id)  // PATCH /reviews/admin/:id/visibility
adminReviewsApi.respond(id, comment)  // POST /reviews/admin/:id/respond
adminReviewsApi.deleteAny(id)    // DELETE /reviews/admin/:id
adminReviewsApi.markHelpful(id)  // POST /reviews/:id/helpful

// ← Fixed: was pointing to wrong /product/admin/* URLs
adminProductsApi.list(params)    // GET /product/admin/list
adminProductsApi.create(data)    // POST /product/addproduct  (multipart/form-data)
adminProductsApi.update(id, data)  // PUT /product/update/:id  (multipart/form-data)
adminProductsApi.delete(id)      // POST /product/remove/:id

adminProfileApi.get()            // GET /admin/profile
adminProfileApi.update(data)     // PATCH /admin/profile
adminProfileApi.changePassword(data)  // PATCH /admin/change-password
```

---

## Admin Dashboard Panels

File: `frontend/src/pages/admin/AdminDashboardPage.jsx`
Sub-panels in `frontend/src/pages/admin/panels/`:

| Panel | File | Backend APIs Used |
|-------|------|-------------------|
| Dashboard | DashboardPanel.jsx | analyticsApi.dashboard |
| Analytics | AnalyticsPanel.jsx | analyticsApi.sales, .payments, .customers, .orderStatus, .coupons, .seller |
| Products | ProductsPanel.jsx | adminProductsApi.*, adminInventoryApi.getAll |
| Orders | OrdersPanel.jsx | adminOrdersApi.*, analyticsApi.orderStatus |
| Inventory | InventoryPanel.jsx | adminInventoryApi.*, analyticsApi.inventory |
| Coupons | CouponsPanel.jsx | adminCouponsApi.* |
| Reviews | ReviewsPanel.jsx | adminReviewsApi.* |
| Returns | ReturnsPanel.jsx | adminReturnsApi.* |
| Profile | ProfilePanel.jsx | adminProfileApi.* |

---

## Critical Invariants & Gotchas

### Authentication
- Tokens are stored in **httpOnly cookies** (not localStorage). The axios interceptor reads them from cookies.
- Two separate cookie names: `userToken` for users, `adminToken` for admins.
- `isAuth` middleware reads `userToken`, `isAuthAdmin` reads `adminToken`.

### Cart
- **Size is required** when adding to cart. The `size` field is always a string like `"M"`.
- Guest cart uses **localStorage** key `neural-guest-cart`. On login, call `cartApi.merge(guestItems)`.
- Cart items require: `{ productId, quantity, size, priceAtAdd, name, image }`.
- Checkout via `POST /api/cart/checkout` — NOT `POST /orders/orders` (that's for direct order creation).

### Orders
- Order routes are at `/orders/*` (no `/api` prefix) — use `rootAxios`, not `api`.
- Payment routes `/orders/:id/pay` and `/payments/:id` also use `rootAxios`.
- Idempotency-Key header is required for: create order, pay, add/update cart item, cart merge.

### Product Images (Admin)
- `POST /api/product/addproduct` and `PUT /api/product/update/:id` require **multipart/form-data**.
- Image fields: `image1`, `image2`, `image3`, `image4` (max 1 file each).
- Other fields sent as form fields (not JSON body).

### Product Stock vs Inventory
- MongoDB `Product` has a `stock` field updated via `PUT /api/product/update-stock/:id`.
- Prisma `Inventory` table tracks per-product stock updated via `PATCH /api/admin/inventory/:productId`.
- The admin frontend uses **Inventory** routes for stock management, not the product stock route.

### Coupon Flow
1. Validate coupon: `POST /api/coupons/validate` (check before checkout)
2. Apply at checkout: pass `couponCode` in `POST /api/cart/checkout` body
3. Apply to existing order: `POST /api/coupons/:orderId/apply` (post-checkout)

### Review Ordering (route conflict)
- `/api/reviews/admin/*` routes must be defined BEFORE `/:reviewId` in the router — already handled correctly in backend.

### Idempotency
Routes that use `checkIdempotency` middleware require an `Idempotency-Key` header (UUID). Frontend uses `v4` from `frontend/src/lib/uuid.js`.

---

## Known Gaps Fixed (2026-05-01)

| # | Issue | Fix Applied |
|---|-------|-------------|
| 1 | `adminProductsApi.create` used wrong URL `/product/admin/create` | Fixed to `POST /product/addproduct` with FormData |
| 2 | `adminProductsApi.update` used wrong URL+method `PATCH /product/admin/:id` | Fixed to `PUT /product/update/:id` with FormData |
| 3 | `adminProductsApi.delete` used wrong URL+method `DELETE /product/admin/:id` | Fixed to `POST /product/remove/:id` |
| 4 | `adminProfileApi` pointed to non-existent backend routes | Added `GET/PATCH /api/admin/profile` + `PATCH /api/admin/change-password` to backend |
| 5 | `reviewApi.update` missing | Added `PATCH /reviews/:reviewId` |
| 6 | `reviewApi.delete` missing | Added `DELETE /reviews/:reviewId` |
| 7 | `productApi.youMayLike` missing | Added `GET /recommendations/you-may-like/:id` |
| 8 | `couponsApi.apply` missing | Added `POST /coupons/:orderId/apply` |
| 9 | `adminReturnsApi.markRefundFailed` missing | Added `PATCH /returns/admin/:id/refund-failed` |
| 10 | `adminInventoryApi.getById` missing | Added `GET /admin/inventory/:productId` |
| 11 | No UI to edit/delete own review in ProductDetailPage | Added edit/delete buttons per review |
| 12 | `/recommendations/you-may-like/:id` never called | Integrated in ProductDetailPage |
| 13 | `markRefundFailed` had no UI | Added button in admin ReturnsPanel |

---

## Event-Driven Architecture (Kafka)

Events flow through Kafka topics for decoupled processing:

| Producer | Consumer | Purpose |
|----------|----------|---------|
| order.producer.js | order.consumer.js | Order lifecycle events |
| payment.producer.js | payment.consumer.js | Payment status updates |
| inventory.producer.js | inventory.consumer.js | Stock reservation/release |
| mail.producer.js | mail.consumer.js | Transactional email dispatch |

Event type constants in `backend/src/events/event-types.js`.

---

## Environment Variables (Backend)

Required in `backend/.env`:
```
DATABASE_URL           PostgreSQL connection string (Prisma)
MONGODB_URI            MongoDB connection string
REDIS_URL              Redis connection string
KAFKA_BROKER           Kafka broker address
JWT_SECRET             JWT signing secret
CLOUDINARY_CLOUD_NAME  Cloudinary config
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SENDGRID_API_KEY       Email sending
RAZORPAY_KEY_ID        Payment gateway
RAZORPAY_KEY_SECRET
ELASTICSEARCH_URL      Search engine
CORS_ORIGIN            Frontend URL (e.g. http://localhost:5173)
```
