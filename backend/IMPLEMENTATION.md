# Error Handling & Validation Guide

## Overview

This backend implements a comprehensive error handling, validation, and logging system with the following components:

### 1. **Validation System (express-validator)**

#### How to Use Validations

All validations are defined in `src/utils/validations.js`:

```javascript
import { authValidations } from "../../utils/validations.js";

// In your routes
authRoutes.post(
  "/registration",
  authValidations.registration, // Add validation rules
  validationErrorHandler, // Add validation error handler
  registration, // Then controller
);
```

#### Validation Rules Structure

```javascript
(body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"));
```

#### Available Validations

- **Auth**: Registration, Login, Google Login, Admin Registration, Admin Login
- **Product**: Add Product, Remove Product, List Product
- **Cart**: Add to Cart, Update Cart
- **Order**: Place Order, Update Status
- **User**: Update Profile

### 2. **Error Handling System**

#### Custom Error Class (ApiError)

```javascript
import { ApiError } from "../utils/api-error.js";

// Usage in service
throw new ApiError(400, "User already exists", [
  { field: "email", message: "Email is already registered" },
]);
```

#### Error Handler Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ],
  "stack": "..." // Only in development
}
```

#### Handled Error Types

- **Validation Errors** (400)
- **Unauthorized** (401) - Invalid/Expired token
- **Forbidden** (403) - Admin access required
- **Not Found** (404) - Resource not found
- **Conflict** (409) - Duplicate entry (unique constraint)
- **Server Errors** (500) - Unexpected errors

### 3. **Logging System (Winston)**

#### Log Levels

- **fatal** (0) - Fatal errors that require immediate action
- **error** (1) - Error events
- **warn** (2) - Warnings
- **info** (3) - Informational messages
- **debug** (4) - Debug messages
- **trace** (5) - Detailed trace information

#### Usage

```javascript
import { logger } from "../utils/logger.js";

// Log different levels
logger.info("User registered successfully", { userId: user._id });
logger.error("Database connection failed", { error: err.message });
logger.warn("Validation error", { field: "email" });
logger.debug("Processing user data", { userData });
```

#### Log Output

- **Console**: Real-time colored output during development
- **File**:
  - `logs/error.log` - Only error logs
  - `logs/combined.log` - All logs

#### Log Format

```
2024-03-24 10:30:45 [info]: User registered successfully {"userId":"507f1f77bcf86cd799439011"}
2024-03-24 10:30:46 [error]: Validation error {"path":"/api/auth/registration","errors":[...]}
```

### 4. **Central Configuration (environment.config.js)**

All environment variables are centralized in `src/config/environment.config.js`:

```javascript
import config from "./config/environment.config.js";

// Access config
console.log(config.app.port); // 6000
console.log(config.jwt.secret); // JWT secret
console.log(config.database.mongoUrl); // MongoDB URL
console.log(config.cors.origin); // CORS origins
```

#### Configuration Sections

- ✅ **app** - App name, environment, port
- ✅ **frontend** - User & admin frontend URLs
- ✅ **database** - MongoDB & PostgreSQL URLs
- ✅ **jwt** - JWT secret & expiry
- ✅ **cloudinary** - Image upload config
- ✅ **redis** - Cache config
- ✅ **kafka** - Event streaming config
- ✅ **razorpay** - Payment gateway
- ✅ **logging** - Logger configuration
- ✅ **cors** - CORS options
- ✅ **cookie** - Cookie options
- ✅ **rateLimit** - Rate limiting (future)

### 5. **Async Handler Wrapper**

Wrap async route handlers to automatically catch errors:

```javascript
import { asyncHandler } from "../utils/async-handler.js";

// Instead of:
export const register = async (req, res, next) => {
  try {
    // logic
  } catch (error) {
    next(error);
  }
};

// Do this (optional - we catch in controllers):
router.post("/register", asyncHandler(register));
```

### 6. **Request/Response Flow**

```
Request
  ↓
1. Express Middleware (CORS, JSON parser)
  ↓
2. Logger Middleware (logs request)
  ↓
3. Validation Middleware (validates input)
  ↓
4. Auth Middleware (checks token)
  ↓
5. Route Handler / Controller
  ↓
6. Service Layer (business logic)
  ↓
7. Response sent
  ↓
8. If Error → Error Handler Middleware
  ↓
Error Response (formatted)
```

### 7. **Best Practices**

✅ **Always validate input** - Add validation to all endpoints
✅ **Use try-catch** - In service layer
✅ **Log important events** - Use logger at appropriate levels
✅ **Throw ApiError** - With proper status code and message
✅ **Handle errors gracefully** - Let error middleware handle it
✅ **Don't log sensitive data** - No passwords, tokens, etc.
✅ **Use config module** - Never access process.env directly
✅ **Provide meaningful errors** - Clear messages for users

### 8. **Common Error Patterns**

```javascript
// ❌ Wrong
if (!user) {
  return res.status(404).json({ error: "Not found" });
}

// ✅ Correct
if (!user) {
  throw new ApiError(404, "User not found");
}

// ❌ Wrong
console.log("User registered:", user);

// ✅ Correct
logger.info("User registered", { userId: user._id });

// ❌ Wrong
const port = process.env.PORT || 6000;

// ✅ Correct
import config from "./config/env.config.js";
const port = config.app.port;
```

## Installation & Setup

```bash
# Install dependencies
npm install express-validator winston

# Create .env file from .env.example
cp .env.example .env

# Create logs directory
mkdir -p logs

# Start server
npm run dev
```

## Testing

Use Postman/Thunder Client with these headers:

```
Content-Type: application/json
Authorization: Bearer <token>
```

## Monitoring

Check logs in real-time:

```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log
```
