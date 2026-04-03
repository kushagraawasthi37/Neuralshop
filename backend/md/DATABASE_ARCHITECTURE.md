# 🏗️ NeuralShop - Database Architecture Guide

## 📋 Overview

NeuralShop uses a **hybrid database architecture** for optimal performance and scalability:

- **MongoDB**: Product & User (flexible schema)
- **PostgreSQL**: Orders, Payments, Inventory, Idempotency (transactional + reliable)
- **Redis**: Cart, Locks, Cache (fast in-memory)

---

## 📂 Database Structure

### 🌿 MongoDB Collections

#### 1️⃣ **Product**

- **Model**: `src/modules/product/product.model.js`
- **Indexes**: category, owner, price, bestseller, createdAt, SKU
- **Features**:
  - Size & stock tracking per size
  - Flexible image storage
  - Owner (seller) reference
  - Rating & review metadata

```javascript
import { Product } from "./product.model.js";

const product = await Product.create({
  name: "Blue T-Shirt",
  price: 499,
  sizes: [
    { size: "M", stock: 50 },
    { size: "L", stock: 30 },
  ],
  // ... other fields
});
```

#### 2️⃣ **User**

- **Model**: `src/modules/user/user.model.js`
- **Indexes**: email, role, authProvider, createdAt
- **Features**:
  - Multi-auth support (local, OAuth)
  - Role-based access (user, admin)
  - Email verification status
  - Password reset tokens
  - **⚠️ NO CART**: Cart moved to Redis

```javascript
import { User } from "./user.model.js";

const user = await User.create({
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  authProvider: "local",
  role: "user",
});
```

---

### 🐘 PostgreSQL Tables (via Prisma)

#### 1️⃣ **Order**

- **Fields**: id, userId, status, totalAmount, address, createdAt, updatedAt
- **Status**: pending → processing → completed (or cancelled)
- **Indexes**: userId, status, createdAt

```javascript
import prisma from "../src/prisma/client.js";

const order = await prisma.order.create({
  data: {
    userId: "mongodb_user_id",
    status: "pending",
    totalAmount: 2500,
    address: {
      street: "123 Main St",
      city: "Delhi",
      zip: "110001",
    },
    items: {
      create: [
        {
          productId: "mongodb_product_id",
          quantity: 2,
          price: 1250,
        },
      ],
    },
  },
});
```

#### 2️⃣ **OrderItem** (Line Items)

- **Fields**: id, orderId, productId, quantity, price
- **Constraint**: `unique(orderId, productId)`
- **Indexes**: orderId, productId
- **Why separate table?**
  - ✅ Scalable
  - ✅ Easy indexing
  - ✅ Analytics & reporting

#### 3️⃣ **Payment**

- **Fields**: id, orderId, status, amount, provider, razorpayOrderId, razorpayPaymentId
- **Status**: pending → success (or failed, refunded)
- **Indexes**: orderId, status, createdAt
- **Integration**: Razorpay payment tracking

```javascript
const payment = await prisma.payment.create({
  data: {
    orderId: "order_id",
    amount: 2500,
    status: "pending",
    provider: "razorpay",
    razorpayOrderId: "order_123",
  },
});
```

#### 4️⃣ **Inventory**

- **Fields**: productId (PK), totalStock, reservedStock, availableStock
- **Indexes**: productId
- **Critical for**:
  - Item locking during checkout
  - Preventing overselling
  - Flash sale handling

```javascript
// During checkout: Reserve items
const inventory = await prisma.inventory.update({
  where: { productId: "prod_123" },
  data: {
    reservedStock: {
      increment: 2,
    },
  },
});

// On payment success: Finalize
const finalInventory = await prisma.inventory.update({
  where: { productId: "prod_123" },
  data: {
    totalStock: {
      decrement: 2,
    },
    reservedStock: {
      decrement: 2,
    },
  },
});
```

#### 5️⃣ **IdempotencyKey** (Prevent Duplicate Payments)

- **Fields**: key (PK), userId, method, endpoint, response, status, expiresAt
- **Indexes**: userId, createdAt, expiresAt
- **Critical for**:
  - Preventing duplicate charges
  - Network retry safety

```javascript
// Before processing payment
const idempotencyKey = await prisma.idempotencyKey.create({
  data: {
    key: `user_123_order_456_${timestamp}`,
    userId: "user_123",
    method: "POST",
    endpoint: "/api/payments/process",
    status: "pending",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  },
});

// If same request comes again, return cached response
const existingKey = await prisma.idempotencyKey.findUnique({
  where: { key: idempotencyKey },
});

if (existingKey && existingKey.status === "completed") {
  return existingKey.response; // Return cached response
}
```

---

### 🚀 Redis (In-Memory Cache)

#### 🛒 **Cart Storage**

- **Key**: `cart:userId`
- **Structure**: `{ items: [ {productId, quantity, price} ], total }`
- **TTL**: 7 days
- **Use**: `src/utils/cart-manager.js`

```javascript
import { cartManager } from "../utils/cart-manager.js";

// Add to cart
const cart = await cartManager.addToCart(userId, productId, quantity, price);
// Result: { items: [...], total: 2500 }

// Get cart
const userCart = await cartManager.getCart(userId);

// Remove item
await cartManager.removeFromCart(userId, productId);

// Clear all
await cartManager.clearCart(userId);
```

#### 🔒 **Locks** (For Inventory)

- **Key**: `lock:productId`
- **Value**: timestamp
- **TTL**: 5-10 minutes
- **Prevents**: Race conditions during checkout

#### 💾 **Cache** (Optional)

- **Keys**: `cache:*`
- **Use**: Cache products, categories, filters
- **TTL**: 1 hour

---

## 🔄 Data Flow Examples

### 📦 Creating an Order

```
1. GET /api/cart (Redis) → Get user's cart
2. GET /api/products (MongoDB) → Verify products exist
3. POST /api/orders (PostgreSQL) →
   - Create Order
   - Create OrderItems (linked to products)
   - Update Inventory (reserve stock)
4. POST /api/payments (PostgreSQL) →
   - Create Payment record
   - Call Razorpay API
   - Create IdempotencyKey
5. DELETE /api/cart (Redis) → Clear user's cart
```

### 💳 Processing Payment

```
1. GET IdempotencyKey → Check if duplicate request
2. POST Razorpay API → Charge payment
3. PATCH Payment → Update status to "success"
4. UPDATE Inventory → Decrement totalStock, clear reservedStock
5. PATCH Order → Update status to "processing"
6. Return IdempotencyKey response → Cached for retries
```

---

## 🛠️ Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
npm install redis  # Additional package for cart
```

### 2️⃣ Configure Environment

```env
# MongoDB
MONGO_URL=mongodb://admin:admin@localhost:27017/neural_shop?authSource=admin

# PostgreSQL
DATABASE_URL=postgresql://admin:admin@localhost:5432/neural_shop?schema=public

# Redis
REDIS_URL=redis://localhost:6379
```

### 3️⃣ Set Up PostgreSQL (Prisma)

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (first time)
npx prisma migrate dev --name init

# Push to database
npx prisma db push

# View data in GUI
npx prisma studio
```

### 4️⃣ Start Docker Services

```bash
docker compose up -d
```

### 5️⃣ Run Application

```bash
npm run dev
```

---

## 📊 Prisma Client Usage (Singleton)

The Prisma client uses **singleton pattern** to prevent multiple instances:

```javascript
// src/prisma/client.js
import prisma from "../src/prisma/client.js";

// In development: Global instance (prevents hot reload issues)
// In production: New instance per request

// Query examples
const orders = await prisma.order.findMany({
  where: { status: "pending" },
  include: { items: true, payment: true },
});

const payment = await prisma.payment.update({
  where: { id: "pay_123" },
  data: { status: "success" },
});
```

---

## 🚨 Critical Operations

### 🔒 Inventory Locking (Prevent Overselling)

```javascript
// 1. Lock item during checkout
await prisma.inventory.update({
  where: { productId: "prod_123" },
  data: { reservedStock: { increment: 2 } },
});

// 2. If payment succeeds → Finalize
await prisma.inventory.update({
  where: { productId: "prod_123" },
  data: {
    totalStock: { decrement: 2 },
    reservedStock: { decrement: 2 },
  },
});

// 3. If payment fails → Release lock
await prisma.inventory.update({
  where: { productId: "prod_123" },
  data: { reservedStock: { decrement: 2 } },
});
```

### 🎯 Idempotent Payments

```javascript
// Check if request already processed
const existing = await prisma.idempotencyKey.findUnique({
  where: { key: idempotencyKey },
});

if (existing?.status === "completed") {
  return existing.response; // Return cached response
}

// Process payment
const result = await processPayment(...);

// Update idempotency key
await prisma.idempotencyKey.update({
  where: { key: idempotencyKey },
  data: {
    status: "completed",
    response: result,
  },
});
```

---

## 📈 Query Optimization

### Indexes Used

- **Order**: `(userId, status, createdAt)`
- **OrderItem**: `(orderId, productId)`
- **Payment**: `(orderId, status, createdAt)`
- **IdempotencyKey**: `(userId, createdAt, expiresAt)`
- **Product**: `(category, subCategory, price, bestseller)`
- **User**: `(email, role, authProvider)`

### Best Practices

1. ✅ Always include indexes for WHERE, JOIN, and ORDER BY
2. ✅ Use `select` to fetch only needed fields
3. ✅ Use `include` wisely (can be slow)
4. ✅ Paginate large results
5. ✅ Use transactions for multi-table operations

---

## 📞 Support

For issues:

1. Check Prisma Studio: `npx prisma studio`
2. Check MongoDB Compass locally
3. Check Redis with: `redis-cli`
4. Review logs in `logs/` directory

---

**Architecture Version**: 1.0  
**Last Updated**: March 2026
