# Backend README

This backend powers the NeuralShop commerce platform. It combines Express-based REST APIs, Prisma for PostgreSQL, Mongoose for MongoDB, Redis for carts and memory, Kafka for event production, Elasticsearch for search, and Razorpay for checkout and webhook verification. The backend is the authoritative source for order state, payment transitions, and inventory reservation.

## Scope & Limitations

- This project is an allowlisted commerce agent and shopping platform, not a general-purpose autonomous system.
- Groq is used for planning and synthesis through the `openai/gpt-oss-20b` model, migrated from a deprecated model that returned 404 model_not_found.
- Kafka is observability-only by design and does not drive payment state.
- Elasticsearch has known mapping limits; MongoDB remains the fallback for query reliability.
- No live production capture test has been executed with Razorpay yet.

## Architecture Summary

The backend is structured around modules for auth, product, cart, wishlist, order, payment, inventory, recommendation, behavior, voice, admin, and AI agent logic. The app uses a single Express entry point and binds all route groups in `src/routes/index.js`. This architecture is intentionally service-oriented: the app exposes commerce endpoints, validates them, commits business state to PostgreSQL and MongoDB, and uses Redis and Kafka as supporting infrastructure rather than as the source of truth for payment or order state.

The major architectural split is:

- MongoDB / Mongoose: users, products, behavior tracking, agent event data
- PostgreSQL / Prisma: orders, payments, inventory, addresses, coupons, idempotency keys, returns
- Redis: cart state, session memory, cache keys, rate-limit data
- Kafka: payment and agent events for observability and downstream workflows
- Elasticsearch: product search enhancement with MongoDB fallback

## Key Technical Decisions

### 1) Payment state is authoritative in PostgreSQL

The order lifecycle is intentionally explicit and guarded. The payment state machine exists to prevent partial success and duplicate processing. The backend updates checkout state transitions only via a defined transition map. The order does not rely on browser events as the final truth.

### 2) Webhook verification uses raw bytes

Razorpay signs the exact raw request bytes. The app installs a raw-body parser before any JSON parsing, then recalculates the HMAC using the exact buffer. This is implemented in `src/middlewares/webhookVerification.middleware.js` and is essential to avoiding false rejections on valid payloads.

### 3) Idempotency protects duplicate flows

The backend uses an idempotency key for payment initiation and webhook processing. This protects against repeated browser submits or webhook replay messages. It is a core defense for payment operations.

### 4) Inventory and cart use guarded transitions

Orders reserve inventory as part of checkout flow, and the payment lifecycle includes failed-payment recovery that restores the pre-checkout cart snapshot.

## Runtime Environment

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop / Docker Engine with Compose
- Linux/macOS/WSL2 recommended
- local or cloud credentials for:
  - GROQ_API_KEY
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - RAZORPAY_WEBHOOK_SECRET
  - DATABASE_URL
  - MONGO_URL
  - REDIS_URL
  - JWT_SECRET
  - JWT_REFRESH_SECRET
  - CLOUDINARY_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL

### Environment file

The repo includes `backend/.env.example` with the required variables. Copy it to `.env` and fill the actual secrets before running the app.

```bash
cd backend
cp .env.example .env
```

## Local Setup

### 1) Start infrastructure services

```bash
cd backend
docker compose up -d postgres mongo redis zookeeper kafka elasticsearch
```

This starts:

- PostgreSQL on port 5432
- MongoDB on port 27017
- Redis on port 6379
- Zookeeper on port 2181
- Kafka on port 29092
- Elasticsearch on port 9200

### 2) Install dependencies

```bash
cd backend
npm install
```

### 3) Generate Prisma client and apply schema

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4) Seed fixtures

```bash
cd backend
npm run seed-fixtures
```

This loads fixture data used by the integration tests and demo flows.

### 5) Start the backend

```bash
cd backend
npm run dev
```

The application boots from `src/server.js` and initializes environment validation, DB connections, route setup, and middleware.

## Auth Flow

The backend exposes authentication routes through `src/modules/auth/auth.routes.js`:

- `POST /api/auth/registration`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/googlelogin`
- `POST /api/auth/refresh`
- `GET /api/auth/user/logout`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`

The auth middleware validates JWT tokens, attaches `req.userId`, and protects sensitive actions. User and admin flows are both supported, with separate admin guards.

## API Reference

The app registers routes in `src/routes/index.js`. Core endpoints include:

### Product APIs

```http
GET /api/product/list?search=black%20shirt&page=1
GET /api/product/browse/all
GET /api/product/:id
POST /api/product/addproduct
PUT /api/product/update/:id
PUT /api/product/update-stock/:id
POST /api/product/remove/:id
```

Example response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "68c1...",
        "name": "Black Wedding Jacket",
        "price": 7499,
        "category": "apparel",
        "sizes": [{ "size": "M", "stock": 4 }]
      }
    ],
    "total": 1
  }
}
```

### Order APIs

```http
POST /api/orders
GET /api/orders
GET /api/orders/:orderId
PATCH /api/orders/:orderId/cancel
```

Example request:

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "<address-uuid>",
    "paymentMethod": "razorpay"
  }'
```

Example response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "orderId": "f1a0...",
    "totalAmount": 8499,
    "checkoutState": "RESERVED"
  }
}
```

### Payment APIs

```http
POST /api/orders/:orderId/pay
GET /api/payments/:orderId
POST /api/payments/webhook
```

Example payment initiation:

```bash
curl -X POST http://localhost:8000/api/orders/<order-id>/pay \
  -H "Authorization: Bearer <jwt>" \
  -H "Idempotency-Key: pay-001"
```

Example response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "7eb3...",
    "razorpayOrderId": "order_ABC123",
    "amount": 7499,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

### Webhook verification example

The backend exposes a raw-body endpoint for Razorpay webhooks:

```bash
curl -X POST http://localhost:8000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: <signature>" \
  --data-binary @payload.json
```

The middleware verifies the HMAC against the exact raw bytes before parsing JSON.

## Payment Lifecycle and Why It Exists

The payment flow is modeled around explicit payment state transitions:

- CREATED
- RESERVED
- PAYMENT_PENDING
- PAID
- FULFILLED
- FAILED
- CANCELLED

`src/modules/order/checkout-state.js` defines the valid transitions. This matters because payment operations are sensitive: a duplicate webhook or partial transaction must not create an inconsistent paid state. These transitions protect the order lifecycle and ensure the failed-payment recovery path can restore the pre-checkout cart snapshot.

## Database Schema

### PostgreSQL / Prisma

The main relational schema is defined in `backend/prisma/schema.prisma`.

Key models:

- `Address`
- `Order`
- `OrderItem`
- `Payment`
- `Inventory`
- `IdempotencyKey`
- `Coupon`
- `OrderDiscount`
- `ReturnRequest`
- `GuestCart`

Notable design choices:

- `Order.checkoutState` is a guarded lifecycle field.
- `Payment` is keyed by `orderId` and includes `razorpayOrderId`.
- `Inventory` is keyed by `adminId + productId + size`.
- `IdempotencyKey` prevents duplicate API requests and replayed webhooks.

### MongoDB / Mongoose

MongoDB stores product and user-related data, including product catalogs and customer records. The app uses a Mongo-backed product model for catalogs and derived behavior tracking.

## Error Handling

The backend uses consistent API utility classes:

- `ApiResponse` wraps successful responses
- `ApiError` wraps failure states
- `asyncHandler` ensures promise rejections are serialized into HTTP responses
- global error middleware handles unexpected exceptions

The app also includes request logging, rate limiting, security middleware, and health checking.

## Health and Observability

The app exposes:

```http
GET /api/healthCheck
```

This route checks MongoDB, Redis, PostgreSQL, Kafka, and Elasticsearch connectivity and returns a health payload. It reports `UP`, `DEGRADED`, or `DOWN` depending on critical and non-critical services.

## Known Limitations

1. Local Kafka uses a plaintext broker while the client expects TLS; this is intentionally deferred.
2. Elasticsearch subCategory mapping remains a known issue; Mongo fallback remains active.
3. No live Razorpay production capture test has been executed yet.
4. Authenticated mutation completion and attribution reconciliation are not yet measured.
5. There is no automated frontend test suite in this repo.

## Verification Commands

The repo contains real validation scripts:

```bash
cd backend
npm run test-agent
npm run test-integration
```

These are the source of the reported project metrics.

## Related Files

- `src/routes/index.js`
- `src/app.js`
- `src/config/environment.config.js`
- `src/middlewares/webhookVerification.middleware.js`
- `src/modules/payment/payment.service.js`
- `prisma/schema.prisma`
- `scripts/evaluate-agent.js`
- `scripts/validate-agent-live.js`
