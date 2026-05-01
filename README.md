# NeuralShop

**AI-Powered Luxury E-Commerce Platform**

NeuralShop is a full-stack luxury fashion marketplace built for the modern web — combining a sleek React SPA with an enterprise-grade Node.js backend. At its core, NeuralShop uses AI-driven recommendation and personalization engines to surface the right products to the right customers at exactly the right moment.

---

## What Makes It Extraordinary

### AI & Intelligent Discovery
- **Personalized Recommendations** — per-user purchase history and behavior analysis drives a tailored product feed for every logged-in shopper
- **Trending Products** — real-time trend signals computed from order volume, view data, and engagement metrics
- **"You May Also Like"** — contextual product adjacency engine shown on every product detail page
- **Top Rated** — curated by verified buyer reviews, weighted by recency and helpfulness votes
- **Similar Products** — category-aware similarity matching to prevent dead-end browsing
- **Related Products** — cross-category discovery to increase basket size
- **Bestsellers Feed** — aggregated sales data powering the general recommendation endpoint

All recommendation surfaces are available as standalone API endpoints, making them composable across any future channel (mobile app, email, widget).

---

## Feature Overview

| Area | Features |
|------|----------|
| **Auth** | Email/password + Google OAuth, OTP email verification, JWT httpOnly cookies, role-based access (user / admin) |
| **Product Discovery** | Full-text Elasticsearch search, paginated browse, category filters, price range, sort, AI recommendations |
| **Cart** | Authenticated persistent cart + guest cart (localStorage), cart merge on login, idempotent mutations, coupon support |
| **Checkout & Orders** | Address management, coupon validation at checkout, Razorpay payment gateway, order tracking, cancellation |
| **Returns** | User-initiated return requests, admin approve/reject/refund workflow, refund status tracking |
| **Reviews** | Verified buyer reviews, star ratings, helpful votes, admin moderation, seller responses, edit/delete own review |
| **Wishlist** | Add/remove/check products, persistent per-user |
| **Admin Dashboard** | 9-panel dashboard — analytics, products, orders, inventory, coupons, reviews, returns, seller profile |
| **Inventory** | Per-product stock tracking, low-stock alerts, bulk CSV/JSON import, admin override |
| **Analytics** | Sales charts, payment analytics, customer metrics, order status distribution, coupon performance, seller-specific stats |
| **Notifications** | SendGrid transactional email for OTP, order events, password reset |
| **Events** | Kafka-based event-driven architecture — order, payment, inventory, and mail topics run as independent consumers |

---

## Tech Stack

### Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js / Express.js 5.1 |
| Primary DB | PostgreSQL via Prisma ORM |
| Secondary DB | MongoDB via Mongoose |
| Cache / Locks | Redis (ioredis) |
| Search | Elasticsearch |
| Messaging | Apache Kafka (kafkajs) |
| Auth | JWT — httpOnly cookies (`userToken`, `adminToken`) |
| File Upload | Cloudinary + Multer |
| Email | SendGrid |
| Payments | Razorpay |

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Routing | React Router 7 |
| State | Zustand 5 |
| Data Fetching | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Styling | Tailwind CSS 4 |
| HTTP | Axios 1 |

---

## Project Structure

```
NeuralShop/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Middleware + route wiring
│   │   ├── server.js               # Entry point
│   │   ├── routes/index.js         # All route mounts
│   │   ├── modules/                # Feature modules (auth, product, cart, orders, …)
│   │   ├── events/                 # Kafka producers + consumers
│   │   └── middleware/             # isAuth, isAuthAdmin, idempotency, upload
│   └── prisma/schema.prisma        # PostgreSQL schema
│
└── frontend/
    └── src/
        ├── api/                    # Axios wrappers per domain
        │   ├── auth.js
        │   ├── products.js         # Includes all recommendation endpoints
        │   ├── cart.js
        │   ├── orders.js
        │   ├── user.js
        │   └── admin.js
        ├── pages/
        │   ├── admin/
        │   │   └── panels/         # 9 admin dashboard panels
        │   └── …                   # 30+ user-facing pages
        └── store/
            ├── authStore.js
            ├── cartStore.js
            └── guestCartStore.js   # localStorage-backed guest cart
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- MongoDB
- Redis
- Kafka
- Elasticsearch

### Backend

```bash
cd backend
cp .env.example .env          # fill in all variables (see below)
npm install
npx prisma migrate dev        # run DB migrations
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # starts at http://localhost:5173
```

---

## Environment Variables

Create `backend/.env`:

```env
# Databases
DATABASE_URL=           # PostgreSQL connection string (Prisma)
MONGODB_URI=            # MongoDB connection string

# Cache & Messaging
REDIS_URL=              # Redis connection string
KAFKA_BROKER=           # Kafka broker address

# Search
ELASTICSEARCH_URL=      # Elasticsearch endpoint

# Auth
JWT_SECRET=             # Random secret string (min 32 chars)

# File Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
SENDGRID_API_KEY=

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Architecture

### Dual-Database Strategy

Transactional data (orders, payments, inventory, addresses, coupons) lives in **PostgreSQL** via Prisma for ACID guarantees. Catalog and user data (products, users, reviews, cart, wishlist) lives in **MongoDB** via Mongoose for flexible schema evolution.

**Prisma (PostgreSQL) models:** `Address`, `Order`, `OrderItem`, `Payment`, `Inventory`, `Coupon`, `Return`, `IdempotencyKey`

**Mongoose (MongoDB) models:** `User`, `Admin`, `Product`, `Review`, `Wishlist`, `Cart`

### Event-Driven Core

Four Kafka topic pairs decouple critical flows:

| Topic | Purpose |
|-------|---------|
| `order.*` | Order lifecycle (created → confirmed → shipped) |
| `payment.*` | Payment status propagation |
| `inventory.*` | Stock reservation and release |
| `mail.*` | Transactional email dispatch |

### Idempotent Mutations

Cart additions, order creation, and payment initiation all require an `Idempotency-Key` header (UUID). The backend persists processed keys in PostgreSQL so duplicate requests are safely deduplicated — essential for network-retry resilience.

### Guest Cart → Authenticated Cart

Unauthenticated users build a cart in `localStorage` (key: `neural-guest-cart`). On login, the frontend automatically merges it into the server cart via `POST /api/cart/merge`.

### Search with Elasticsearch Fallback

Product search queries hit Elasticsearch first. If ES returns 0 results, the query falls through to MongoDB automatically. ES results are always enriched from MongoDB to ensure prices, sizes, and reviews are current.

---

## API Overview

NeuralShop exposes ~80 REST endpoints across 14 domains:

```
/api/auth/*             Authentication & OTP flows
/api/product/*          Product catalog
/api/recommendations/*  AI recommendation engine
/api/cart/*             Cart management
/api/user/*             Profile & address book
/api/wishlist/*         Wishlist
/api/reviews/*          Product reviews
/api/coupons/*          Discount codes
/api/returns/*          Return requests
/api/analytics/*        Seller analytics
/api/admin/*            Admin profile + orders + inventory
/orders/*               Order lifecycle  (no /api prefix)
/payments/*             Razorpay payment  (no /api prefix)
/webhook                Razorpay webhook callback
```

### AI Recommendation API

All endpoints are public unless noted.

```
GET  /api/recommendations                      Bestsellers / general feed
GET  /api/recommendations/trending             Trending right now
GET  /api/recommendations/top-rated            Highest rated by buyers
GET  /api/recommendations/similar/:productId   Same-category products
GET  /api/recommendations/related/:productId   Cross-category discovery
GET  /api/recommendations/you-may-like/:productId  Contextual "you may also like"
GET  /api/recommendations/personalized         [Auth] Per-user personalized feed
```

### Auth — `/api/auth`

```
POST   /api/auth/registration          User signup → sends OTP email
POST   /api/auth/login                 User login → sets userToken cookie
GET    /api/auth/user/logout           [Auth] Clears userToken cookie
POST   /api/auth/adminregister         Admin/seller signup
POST   /api/auth/adminlogin            Admin login → sets adminToken cookie
GET    /api/auth/admin/logout          [Admin] Clears adminToken cookie
POST   /api/auth/verify-email          Verify user email with OTP
POST   /api/auth/verify-admin-email    Verify admin email with OTP
POST   /api/auth/resend-otp            Resend OTP
POST   /api/auth/request-password-reset
POST   /api/auth/reset-password
POST   /api/auth/verify-reset-otp
POST   /api/auth/googlelogin           Google OAuth login
```

### Product — `/api/product`

```
POST   /api/product/addproduct         [Admin] Create product (multipart/form-data)
GET    /api/product/admin/list         [Admin] Admin product list
POST   /api/product/remove/:id         [Admin] Delete product
PUT    /api/product/update/:id         [Admin] Update product (multipart/form-data)
PUT    /api/product/update-stock/:id   [Admin] Update stock field
GET    /api/product/browse/all         Public paginated browse
GET    /api/product/list               Public filtered list
GET    /api/product/:id                Public single product detail
```

### Cart — `/api/cart`

```
GET    /api/cart                       [Auth] Get user cart
GET    /api/cart/summary               [Auth] Cart total/count summary
POST   /api/cart/items                 [Auth+Idempotent] Add item
PATCH  /api/cart/items                 [Auth+Idempotent] Update item quantity
DELETE /api/cart/items                 [Auth] Remove item
DELETE /api/cart/clear-cart            [Auth] Clear entire cart
POST   /api/cart/validate              [Auth] Validate cart items/prices
POST   /api/cart/checkout              [Auth+Idempotent] Create order from cart
POST   /api/cart/merge                 [Auth] Merge guest cart into user cart
```

### Orders — `/orders` (no /api prefix)

```
POST   /orders/orders                  [Auth+Idempotent] Create order
GET    /orders/orders                  [Auth] List user's orders
GET    /orders/orders/:orderId         [Auth] Get single order detail
PATCH  /orders/orders/:orderId/cancel  [Auth] Cancel order
```

### Payments — root (no prefix)

```
POST   /orders/:orderId/pay            [Auth+Idempotent] Initiate Razorpay payment
GET    /payments/:orderId              [Auth] Get payment status
POST   /webhook                        Razorpay webhook callback
```

### Reviews — `/api/reviews`

```
GET    /api/reviews/product/:productId           Public — get reviews for product
POST   /api/reviews/product/:productId           [Auth] Create review
PATCH  /api/reviews/:reviewId                    [Auth] Update own review
DELETE /api/reviews/:reviewId                    [Auth] Delete own review
POST   /api/reviews/:reviewId/helpful            Mark review helpful
GET    /api/reviews/admin/all                    [Admin] All reviews with pagination
PATCH  /api/reviews/admin/:reviewId/visibility   [Admin] Toggle review visibility
DELETE /api/reviews/admin/:reviewId              [Admin] Delete review
POST   /api/reviews/admin/:reviewId/respond      [Admin] Respond to review
```

### Returns — `/api/returns`

```
POST   /api/returns/request            [Auth] User requests return
GET    /api/returns                    [Auth] User's return list
GET    /api/returns/:returnId          [Auth] Single return detail
PATCH  /api/returns/:returnId/cancel   [Auth] Cancel return
GET    /api/returns/admin/stats        [Admin] Return statistics
GET    /api/returns/admin/all          [Admin] All return requests
PATCH  /api/returns/admin/:returnId/approve
PATCH  /api/returns/admin/:returnId/reject
PATCH  /api/returns/admin/:returnId/refund
PATCH  /api/returns/admin/:returnId/refund-failed
```

### Coupons — `/api/coupons`

```
POST   /api/coupons/validate           [Auth] Validate coupon
GET    /api/coupons/:code              Public — get coupon info
POST   /api/coupons/:orderId/apply     [Auth] Apply coupon to existing order
POST   /api/coupons/admin/create       [Admin] Create coupon
GET    /api/coupons/admin/all          [Admin] List all coupons
PATCH  /api/coupons/admin/:couponId    [Admin] Update coupon
PATCH  /api/coupons/admin/:couponId/toggle
DELETE /api/coupons/admin/:couponId
```

### Inventory — `/api/admin/inventory`

```
GET    /api/admin/inventory                  [Admin] All inventory
GET    /api/admin/inventory/:productId       [Admin] Single product inventory
GET    /api/admin/inventory/low-stock        [Admin] Low stock products
PATCH  /api/admin/inventory/:productId       [Admin] Manually update stock
POST   /api/admin/inventory/bulk/json        [Admin] Bulk update from JSON
POST   /api/admin/inventory/bulk/csv         [Admin] Bulk update from CSV
```

### Analytics — `/api/analytics` (all Admin)

```
GET    /api/analytics/dashboard
GET    /api/analytics/sales
GET    /api/analytics/payments
GET    /api/analytics/customers
GET    /api/analytics/inventory
GET    /api/analytics/orders/status
GET    /api/analytics/coupons
GET    /api/analytics/seller
```

### User — `/api/user`

```
GET    /api/user/profile
PATCH  /api/user/profile
GET    /api/user/addresses
POST   /api/user/addresses
PATCH  /api/user/addresses/:addressId
DELETE /api/user/addresses/:addressId
GET    /api/user/addresses/default
```

### Wishlist — `/api/wishlist`

```
GET    /api/wishlist
POST   /api/wishlist/add
POST   /api/wishlist/remove
GET    /api/wishlist/check
DELETE /api/wishlist/clear
```

### Admin — `/api/admin`

```
GET    /api/admin/profile
PATCH  /api/admin/profile
PATCH  /api/admin/change-password
GET    /api/admin/orders
GET    /api/admin/orders/:orderId
PATCH  /api/admin/orders/order-items/:itemId/status
PATCH  /api/admin/orders/bulk/status
```

---

## Frontend

### Pages

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
| `/cart` | CartPage | public |
| `/checkout` | CheckoutPage | public |
| `/order-confirmation` | OrderConfirmationPage | public |
| `/orders/:orderId/track` | OrderTrackingPage | user |
| `/account/profile` | ProfilePage | user |
| `/account/orders` | OrderHistoryPage | user |
| `/account/wishlist` | WishlistPage | user |
| `/account/returns` | ReturnsPage | user |
| `/admin/login` | AdminLoginPage | public |
| `/admin/register` | AdminRegisterPage | public |
| `/admin/dashboard` | AdminDashboardPage | admin |

### State Stores (Zustand)

**`authStore.js`** — `{ user, token, role, pendingEmail, pendingRole, isLoggedIn, setAuth, setPendingEmail, setPendingRole, logout }`

**`cartStore.js`** — `{ cart, loading, error, fetchCart, addItem, updateItem, removeItem, clearCart, getItemCount, getTotal }`

**`guestCartStore.js`** — localStorage-backed `{ items, addItem, removeItem, updateItem, clear }`

### Axios Instances

- `src/api/axios.js` — base URL `/api`, attaches `userToken`/`adminToken` cookie automatically
- `src/api/rootAxios.js` — base URL `/`, for routes mounted at root (`/orders`, `/payments`)

---

## Admin Dashboard

Sellers access a 9-panel dashboard at `/admin/dashboard`:

| Panel | Capabilities |
|-------|-------------|
| **Dashboard** | Revenue, orders, customers — at a glance |
| **Analytics** | Sales over time, payment breakdown, coupon performance, customer cohorts |
| **Products** | Add / edit / delete products with up to 4 Cloudinary images, size variants |
| **Orders** | View all orders, update per-item status, bulk status updates |
| **Inventory** | Stock levels, low-stock alerts, bulk import via CSV or JSON |
| **Coupons** | Create, edit, activate/deactivate, delete discount codes |
| **Reviews** | Moderate reviews, toggle visibility, respond as seller, delete |
| **Returns** | Approve / reject returns, process refunds, mark failed refunds |
| **Profile** | Update store name, business details, change password |

---

## Critical Implementation Notes

### Authentication
- Tokens are stored in **httpOnly cookies** — not localStorage.
- Two separate cookie names: `userToken` for users, `adminToken` for admins.
- `isAuth` middleware reads `userToken`; `isAuthAdmin` reads `adminToken`.

### Cart
- **Size is required** when adding to cart (`size` is always a string like `"M"`).
- Guest cart uses localStorage key `neural-guest-cart`. On login, call `cartApi.merge(guestItems)`.
- Cart items require: `{ productId, quantity, size, priceAtAdd, name, image }`.
- Checkout via `POST /api/cart/checkout` — not `POST /orders/orders`.

### Orders & Payments
- Order and payment routes use `/orders/*` and `/payments/*` (no `/api` prefix) — use `rootAxios`.
- `Idempotency-Key` header (UUID) is required for: create order, pay, add/update cart item, cart merge.

### Product Images (Admin)
- `POST /api/product/addproduct` and `PUT /api/product/update/:id` require **multipart/form-data**.
- Image fields: `image1`, `image2`, `image3`, `image4` (max 1 file each).

### Product Stock vs Inventory
- MongoDB `Product` has a `stock` field updated via `PUT /api/product/update-stock/:id`.
- Prisma `Inventory` table tracks per-product stock updated via `PATCH /api/admin/inventory/:productId`.
- The admin frontend uses **Inventory** routes for stock management.

### Coupon Flow
1. Validate: `POST /api/coupons/validate` (before checkout)
2. Apply at checkout: pass `couponCode` in `POST /api/cart/checkout` body
3. Apply to existing order: `POST /api/coupons/:orderId/apply`

### Review Route Ordering
`/api/reviews/admin/*` routes must be defined **before** `/:reviewId` in the router to avoid conflicts.

---

## License

MIT
