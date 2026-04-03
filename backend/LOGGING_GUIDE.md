# Enhanced Logging Guide with Module Tracking

## Overview

The application now includes enhanced logging that automatically tracks which module/service is throwing errors. This makes debugging much easier in production environments.

## Features

### ✅ Automatic Module Detection

Module names are **automatically extracted** from the stack trace:

- `src/modules/auth/auth.service.js` → detected as `auth` module
- `src/config/db.js` → detected as `config` module
- `src/middlewares/error.middleware.js` → detected as `error` middleware

### 📦 Module Information in Logs

```
❌ 2026-03-24 01:50:48 [error] Error encountered: User not found
    module: 📦 auth
    statusCode: 404
    errors: []
```

The module appears with:

- 📦 icon for easy visual identification
- Cyan colored module name (in console)
- Included in error responses for debugging

## Usage Examples

### 1. **Automatic Detection (No Changes Needed)**

Errors thrown from any module are automatically tracked:

```javascript
// In src/modules/auth/auth.service.js
export const registerUserService = async (name, email, password) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists"); // Module auto-detected as 'auth'
  }
  // ...
};
```

**Log Output:**

```
❌ 2026-03-24 01:50:48 [error] User already exists
    module: 📦 auth
    statusCode: 400
```

### 2. **Using ApiError with Explicit Module (Recommended for Services)**

For better control, use `ApiError` with module specification:

```javascript
import { ApiError } from "../../utils/api-error.js";

export const registerUserService = async (name, email, password) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(
      409,
      "Email already registered",
      null,
      "auth", // Explicitly specify module
    );
  }
  // ...
};
```

### 3. **Using logError Helper**

For explicit error logging with module tracking:

```javascript
import { logError } from "../../utils/logger.js";

export const getUserService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    logError("Failed to retrieve user", error, {
      module: "user",
      userId,
    });
    throw error;
  }
};
```

## Log Levels & Symbols

| Level | Symbol | Color        | Usage                       |
| ----- | ------ | ------------ | --------------------------- |
| Fatal | 💀     | Bold Red     | Unrecoverable system errors |
| Error | ❌     | Red          | Application errors          |
| Warn  | ⚠️     | Bold Yellow  | Warnings, deprecations      |
| Info  | ℹ️     | Bold Cyan    | General information         |
| Debug | 🐛     | Bold Magenta | Debugging information       |
| Trace | 📍     | Gray         | Detailed tracing            |

## Log Files

Logs are automatically written to `logs/` directory:

### `error.log`

Contains only errors and fatal issues (level >= error)

```json
{
  "timestamp": "2026-03-24 01:50:48.123",
  "level": "error",
  "message": "Failed to connect to MongoDB",
  "module": "config",
  "stack": "MongooseError: ...",
  "service": "neural-shop-backend"
}
```

### `combined.log`

Contains all log levels for comprehensive monitoring

```json
{
  "timestamp": "2026-03-24 01:50:48.123",
  "level": "info",
  "message": "Server is running on port 6000",
  "port": 6000,
  "environment": "development",
  "service": "neural-shop-backend"
}
```

## Best Practices

### ✅ DO:

- ✅ Use `ApiError` with a module name in services
- ✅ Let stack traces auto-detect modules when appropriate
- ✅ Include relevant context in error details (userId, itemId, etc.)
- ✅ Use specific error messages that describe the problem

### ❌ DON'T:

- ❌ Throw plain `Error` objects from services (use `ApiError`)
- ❌ Skip module information in custom logging
- ❌ Log sensitive data (passwords, keys, tokens)

## Example: Complete Service Error Handling

```javascript
// src/modules/product/product.service.js
import { ApiError } from "../../utils/api-error.js";
import Product from "./product.model.js";

export const getProductService = async (productId) => {
  try {
    if (!productId) {
      throw new ApiError(
        400,
        "Product ID is required",
        null,
        "product", // Explicit module
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found", null, "product");
    }

    return product;
  } catch (error) {
    // Error is automatically caught by error handler middleware
    // Module info included via ApiError constructor
    throw error;
  }
};
```

**When error occurs, console shows:**

```
❌ 2026-03-24 01:50:48 [error] Product not found
    module: 📦 product
    statusCode: 404
    productId: "123abc"
```

## Debugging in Different Environments

### Development

- Full stack traces visible
- Request bodies included in logs
- Module names clearly shown
- Colors enabled for easy scanning

### Production

- Stack traces stored in files (not sent to client)
- Request bodies hidden for security
- Module names still included for tracking
- All logs to `logs/` directory (ensure backups)

## API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... }
}
```

### Error Response (Development)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found",
  "module": "product",
  "errors": [],
  "stack": "Error: Product not found\n    at ..."
}
```

### Error Response (Production)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found",
  "module": "product"
}
```

## Configuration

Environment variables for logging:

```bash
# Set log level (trace, debug, info, warn, error, fatal)
LOG_LEVEL=debug

# Node environment affects stack trace visibility
NODE_ENV=development  # Shows all details
NODE_ENV=production   # Hides sensitive info
```

## Viewing Logs

### Real-time Console

```bash
npm run dev
```

### Historical Logs

```bash
# View error logs
cat logs/error.log | grep "module"

# View all logs
cat logs/combined.log | tail -100
```

## Migration Guide: Updating Existing Code

If updating existing services without explicit module info, module will be auto-detected.

**Before:**

```javascript
throw new Error("Something went wrong");
```

**After (Recommended):**

```javascript
throw new ApiError(
  500,
  "Something went wrong",
  null,
  "module-name", // Add explicit module
);
```

The error system will work with both approaches - auto-detection just provides a fallback.
