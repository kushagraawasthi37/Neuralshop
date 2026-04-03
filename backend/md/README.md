# Backend Folder Structure

## Overview

This is a domain-based backend architecture using Node.js, Express, and MongoDB.

## Folder Structure

```
src/
├── config/                      # Configuration files
│   ├── db.js                   # MongoDB connection
│   ├── cloudinary.js           # Cloudinary upload config
│   ├── jwt.js                  # JWT token generation
│   ├── redis.js                # Redis connection
│   └── kafka.js                # Kafka producer/consumer setup
│
├── modules/                     # Domain-based modules
│   │
│   ├── auth/
│   │   ├── auth.controller.js  # Auth endpoints
│   │   ├── auth.service.js     # Auth business logic
│   │   ├── auth.routes.js      # Auth routes
│   │   ├── auth.validation.js  # Auth validation
│   │   └── auth.model.js       # Admin model
│   │
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.routes.js
│   │   └── user.model.js
│   │
│   ├── product/
│   │   ├── product.controller.js
│   │   ├── product.service.js
│   │   ├── product.routes.js
│   │   └── product.model.js
│   │
│   ├── order/
│   │   ├── order.controller.js
│   │   ├── order.service.js
│   │   ├── order.routes.js
│   │   └── order.model.js
│   │
│   ├── cart/
│   │   ├── cart.controller.js
│   │   ├── cart.service.js
│   │   └── cart.routes.js
│   │
│   ├── payment/
│   │   ├── payment.controller.js
│   │   ├── payment.service.js
│   │   └── payment.routes.js
│   │
│   └── inventory/
│       ├── inventory.service.js
│       ├── inventory.consumer.js
│       └── inventory.routes.js
│
├── prisma/                      # Prisma ORM
│   ├── client.js
│   └── schema.prisma
│
├── middlewares/
│   ├── auth.middleware.js       # JWT authentication
│   ├── admin.middleware.js      # Admin authorization
│   ├── error.middleware.js      # Error handling
│   └── multer.middleware.js     # File uploads
│
├── events/                       # Event-driven system
│   ├── producers/
│   │   └── order.producer.js    # Produce order events
│   ├── consumers/
│   │   ├── payment.consumer.js  # Consume payment events
│   │   └── inventory.consumer.js
│   └── event-types.js            # Event type constants
│
├── utils/
│   ├── api-response.js           # API response formatter
│   ├── logger.js                # Logging utility
│   └── idempotency-util.js           # Idempotency handling
│
├── routes/
│   └── index.js                 # Central route loader
│
├── app.js                       # Express app setup
└── server.js                    # Server entry point

```

## Architecture Principles

### 1. **Domain-Based Organization**

- Each business domain (auth, product, order, etc.) is self-contained
- Easy to scale and maintain
- Clear separation of concerns

### 2. **Service Layer Pattern**

- Controllers handle HTTP requests/responses
- Services contain business logic
- Models represent database schemas

### 3. **Event-Driven Architecture**

- Kafka for asynchronous communication
- Producers emit events (e.g., order creation)
- Consumers handle events (e.g., payment processing)

### 4. **Middleware Stack**

- Authentication for protected routes
- Authorization checks for admin-only operations
- File upload handling with Multer
- Centralized error handling

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

Create a `.env` file with:

```
MONGO_URL=mongodb://...
JWT_SECRET=your_secret
JWT_EXPIRY_TIME=7d
PORT=6000
NODE_ENV=development

# Cloudinary
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=neural-shop
KAFKA_GROUP_ID=neural-shop-consumer-group

# Frontend URLs
FRONTEND_URL_USER=http://localhost:3000
FRONTEND_URL_ADMIN=http://localhost:3001
```

## API Routes

- `/api/auth` - Authentication (login, register)
- `/api/user` - User operations
- `/api/product` - Product management
- `/api/cart` - Shopping cart
- `/api/order` - Order management
- `/api/payment` - Payment processing
- `/api/inventory` - Inventory management
