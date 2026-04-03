# Comprehensive Logging Files Guide

## Overview

The NeuralShop Backend implements a multi-file logging system using Winston Logger. Each log file serves a specific purpose for debugging, monitoring, and auditing different aspects of the application.

## Log Files Structure

All log files are stored in the `logs/` directory at the root of the backend project.

```
logs/
├── combined.log          # All log levels combined
├── debug.log             # Debug-level messages
├── info.log              # Info-level messages
├── warn.log              # Warning-level messages
├── error.log             # Error-level messages
├── fatal.log             # Fatal errors only
├── http.log              # HTTP request/response logs
├── database.log          # Database operations
├── auth.log              # Authentication/Authorization events
├── performance.log       # Performance metrics and slowdowns
└── payment.log           # Payment transaction logs
```

## Detailed Log File Reference

### 1. **combined.log** (Main Log File)

- **Purpose**: Aggregated log of all messages from all severity levels
- **Log Levels**: ALL (fatal, error, warn, info, debug, trace)
- **Rotation**: 10MB per file, keeps 10 files
- **Use Case**: General monitoring and troubleshooting
- **Format**: JSON structured logs

```json
{
  "level": "info",
  "message": "Server started successfully",
  "timestamp": "2024-03-24 14:32:10.523",
  "service": "neural-shop-backend"
}
```

---

### 2. **error.log** (Error Level)

- **Purpose**: Captures all errors encountered in the application
- **Log Levels**: error, fatal
- **Rotation**: 5MB per file, keeps 5 files
- **Use Case**: Quick error diagnosis and failure investigation
- **Format**: JSON structured logs with stack traces

```json
{
  "level": "error",
  "message": "Database connection failed",
  "timestamp": "2024-03-24 14:35:22.891",
  "module": "📦 database",
  "stack": "Error: ECONNREFUSED 127.0.0.1:27017"
}
```

---

### 3. **fatal.log** (Critical Only)

- **Purpose**: Only the most critical system failures
- **Log Levels**: fatal (0)
- **Rotation**: 5MB per file, keeps 10 files (more retention)
- **Use Case**: Database outages, server crashes, security breaches
- **Format**: JSON structured logs with detailed context

```json
{
  "level": "fatal",
  "message": "System shutdown initiated",
  "timestamp": "2024-03-24 14:35:22.891",
  "reason": "Database unavailable"
}
```

---

### 4. **warn.log** (Warnings)

- **Purpose**: Potential issues that don't prevent operation
- **Log Levels**: warn
- **Rotation**: 5MB per file, keeps 5 files
- **Use Case**: Deprecated API usage, resource warnings, unusual conditions
- **Format**: JSON structured logs

```json
{
  "level": "warn",
  "message": "Memory usage above 80%",
  "timestamp": "2024-03-24 14:35:22.891",
  "memoryUsage": "82%"
}
```

---

### 5. **debug.log** (Development/Debugging)

- **Purpose**: Detailed debugging information
- **Log Levels**: debug, trace
- **Rotation**: 10MB per file, keeps 10 files (larger to capture more details)
- **Use Case**: Development, detailed diagnostics, variable inspection
- **Format**: JSON structured logs with metadata

```json
{
  "level": "debug",
  "message": "User authentication initiated",
  "timestamp": "2024-03-24 14:35:22.891",
  "userId": "user_123",
  "email": "user@example.com"
}
```

---

### 6. **info.log** (Informational)

- **Purpose**: General informational messages
- **Log Levels**: info
- **Rotation**: 5MB per file, keeps 5 files
- **Use Case**: App startup, shutdown, configuration loaded
- **Format**: JSON structured logs

```json
{
  "level": "info",
  "message": "🚀 Server started on port 6000",
  "timestamp": "2024-03-24 14:35:22.891"
}
```

---

### 7. **http.log** (HTTP Requests)

- **Purpose**: All HTTP request/response activities
- **Includes**:
  - Request method, path, status code
  - Response time (duration)
  - User ID and IP address
  - User agent information
- **Rotation**: 10MB per file, keeps 10 files
- **Use Case**: API traffic analysis, performance monitoring, access auditing
- **Format**: JSON structured logs

#### Example Entry:

```json
{
  "timestamp": "2024-03-24 14:35:22.891",
  "message": "HTTP GET /api/products [200]",
  "statusCode": 200,
  "duration": "145ms",
  "userId": "user_123",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "category": "http"
}
```

#### Usage in Code:

```javascript
import { logHttpRequest } from "../utils/logger.js";

logHttpRequest({
  method: "GET",
  path: "/api/products",
  statusCode: 200,
  duration: 145,
  userId: "user_123",
  ipAddress: req.ip,
  userAgent: req.get("user-agent"),
});
```

---

### 8. **database.log** (Database Operations)

- **Purpose**: All database operations (queries, inserts, updates, deletes)
- **Includes**:
  - Operation type (SELECT, INSERT, UPDATE, DELETE)
  - Collection/table name
  - Execution time
  - Query details
  - Result summary
- **Rotation**: 10MB per file, keeps 10 files
- **Use Case**: Query performance analysis, debugging data issues, audit trail
- **Format**: JSON structured logs

#### Example Entry:

```json
{
  "timestamp": "2024-03-24 14:35:22.891",
  "message": "DB FIND products",
  "operation": "find",
  "collection": "products",
  "duration": "23ms",
  "query": { "status": "active" },
  "result": "23 documents found",
  "category": "database"
}
```

#### Usage in Code:

```javascript
import { logDatabaseOperation } from "../utils/logger.js";

const startTime = Date.now();
const products = await Product.find({ status: "active" });
const duration = Date.now() - startTime;

logDatabaseOperation({
  operation: "find",
  collection: "products",
  duration: duration,
  query: { status: "active" },
  result: `${products.length} documents found`,
});
```

---

### 9. **auth.log** (Authentication/Authorization)

- **Purpose**: All authentication and authorization events
- **Includes**:
  - Event type (login, logout, token refresh, permission denied)
  - User information
  - IP address
  - Status (success/failure)
  - Failure reason if applicable
- **Rotation**: 5MB per file, keeps 15 files (extensive retention for security)
- **Use Case**: Security auditing, intrusion detection, user activity tracking
- **Format**: JSON structured logs

#### Example Entries:

```json
{
  "timestamp": "2024-03-24 14:35:22.891",
  "message": "AUTH LOGIN_SUCCESS",
  "event": "login_success",
  "userId": "user_123",
  "email": "user@example.com",
  "ipAddress": "192.168.1.1",
  "status": "success",
  "category": "auth"
}
```

```json
{
  "timestamp": "2024-03-24 14:38:15.234",
  "message": "AUTH LOGIN_FAILED",
  "event": "login_failed",
  "email": "user@example.com",
  "ipAddress": "192.168.1.50",
  "status": "failed",
  "reason": "Invalid password",
  "category": "auth"
}
```

#### Usage in Code:

```javascript
import { logAuthEvent } from "../utils/logger.js";

// Successful login
logAuthEvent({
  event: "login_success",
  userId: user._id,
  email: user.email,
  ipAddress: req.ip,
  status: "success",
});

// Failed authorization
logAuthEvent({
  event: "permission_denied",
  userId: req.userId,
  email: req.email,
  ipAddress: req.ip,
  status: "failed",
  reason: "Admin role required",
});
```

---

### 10. **performance.log** (Performance Metrics)

- **Purpose**: Track operation performance and identify slowdowns
- **Includes**:
  - Operation name
  - Execution time
  - Service name
  - Performance threshold
- **Rotation**: 10MB per file, keeps 10 files
- **Use Case**:
  - Performance optimization
  - SLA monitoring
  - Bottleneck identification
- **Format**: JSON structured logs
- **Threshold**: Operations > 1000ms trigger WARNING level

#### Example Entry:

```json
{
  "timestamp": "2024-03-24 14:35:22.891",
  "message": "PERF fetch_user_products",
  "level": "warn",
  "operation": "fetch_user_products",
  "duration": "1250ms",
  "service": "product.service",
  "threshold": "1000ms",
  "category": "performance"
}
```

#### Usage in Code:

```javascript
import { logPerformance } from "../utils/logger.js";

const startTime = Date.now();
const products = await fetchUserProducts(userId);
const duration = Date.now() - startTime;

logPerformance({
  operation: "fetch_user_products",
  duration: duration,
  service: "product.service",
  threshold: 1000, // Alert if > 1 second
});
```

---

### 11. **payment.log** (Payment Transactions)

- **Purpose**: Track all payment-related transactions for reconciliation
- **Includes**:
  - Order ID
  - User ID
  - Amount and currency
  - Transaction status
  - Payment provider (Razorpay, Stripe, etc.)
  - Transaction ID
- **Rotation**: 5MB per file, keeps 20 files (maximum retention for financial records)
- **Use Case**:
  - Payment reconciliation
  - PCI compliance
  - Fraud detection
  - Revenue reporting
- **Format**: JSON structured logs

#### Example Entry:

```json
{
  "timestamp": "2024-03-24 14:35:22.891",
  "message": "PAYMENT SUCCESS",
  "orderId": "order_12345",
  "userId": "user_123",
  "amount": "500.00",
  "currency": "INR",
  "status": "success",
  "provider": "razorpay",
  "txnId": "razorpay_pay_123456789",
  "category": "payment"
}
```

#### Usage in Code:

```javascript
import { logPaymentTransaction } from "../utils/logger.js";

logPaymentTransaction({
  orderId: order._id,
  userId: userId,
  amount: order.totalAmount,
  currency: "INR",
  status: "success",
  provider: "razorpay",
  txnId: verificationResponse.razorpay_payment_id,
});
```

---

## Configuration

### Environment Variables

```env
# Basic Logging
LOG_LEVEL=debug                   # fatal | error | warn | info | debug | trace
ENABLE_FILE_LOGGING=true
ENABLE_CONSOLE_LOGGING=true

# File Rotation Settings
LOG_MAX_FILE_SIZE=5242880         # 5MB (size when file rotates)
LOG_MAX_FILES=5                   # Default number of files to keep

# Category-Specific Settings
LOG_HTTP_ENABLED=true
LOG_HTTP_MAX_FILES=10
LOG_DATABASE_ENABLED=true
LOG_DB_MAX_FILES=10
LOG_AUTH_ENABLED=true
LOG_AUTH_MAX_FILES=15             # More retention for security
LOG_PERFORMANCE_ENABLED=true
LOG_PERF_MAX_FILES=10
LOG_PERF_THRESHOLD_MS=1000        # Alert if > 1 second
LOG_PAYMENT_ENABLED=true
LOG_PAYMENT_MAX_FILES=20          # Max retention for financial logs
```

### Centralized Config Access

```javascript
import config from "./src/config/environment.config.js";

// Access logging config
config.logging.level; // Current log level
config.logging.enableFileLogging; // Whether file logging is enabled
config.logging.maxFileSize; // File rotation size
config.logging.categories; // All category-specific settings
config.logging.categories.performance.threshold; // Perf threshold in ms
```

---

## Usage Examples

### Example 1: Complete HTTP Request Logging

```javascript
import { logHttpRequest } from "../utils/logger.js";

app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logHttpRequest({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.userId || "anonymous",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
});
```

### Example 2: Database Operation Logging

```javascript
import { logDatabaseOperation } from "../utils/logger.js";

export const findProductById = async (productId) => {
  const startTime = Date.now();
  const product = await Product.findById(productId);
  const duration = Date.now() - startTime;

  logDatabaseOperation({
    operation: "findById",
    collection: "products",
    duration,
    query: { _id: productId },
    result: product ? "Found" : "Not found",
  });

  return product;
};
```

### Example 3: Payment Transaction Logging

```javascript
import { logPaymentTransaction } from "../utils/logger.js";

const handlePaymentCallback = async (paymentData) => {
  const transaction = await verifyPayment(paymentData);

  logPaymentTransaction({
    orderId: transaction.orderId,
    userId: transaction.userId,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status,
    provider: "razorpay",
    txnId: transaction.razorpayPaymentId,
  });

  return transaction;
};
```

### Example 4: Security Audit with Auth Logging

```javascript
import { logAuthEvent } from "../utils/logger.js";

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user || !user.verifyPassword(password)) {
      logAuthEvent({
        event: "login_failed",
        email,
        ipAddress: req.ip,
        status: "failed",
        reason: "Invalid credentials",
      });
      throw new Error("Invalid credentials");
    }

    logAuthEvent({
      event: "login_success",
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      status: "success",
    });

    return user;
  } catch (error) {
    throw error;
  }
};
```

---

## Log Analysis Tips

### 1. Find Slow Queries

```bash
grep "PERF\|duration" logs/performance.log | grep -E "duration.*[5-9][0-9]{2,}ms|[1-9][0-9]{3,}ms"
```

### 2. Find Failed Authentication Attempts

```bash
grep "LOGIN_FAILED\|permission_denied" logs/auth.log
```

### 3. Find Database Errors

```bash
grep "ERROR\|error" logs/database.log
```

### 4. Monitor Failed Payments

```bash
grep "failed\|Failed" logs/payment.log
```

### 5. Real-time Log Monitoring

```bash
# Watch for new error entries
tail -f logs/error.log

# Watch specific category
tail -f logs/auth.log

# Watch all logs with grep filter
tail -f logs/combined.log | grep "error"
```

---

## Best Practices

1. **Always Include Context**: When logging, include relevant IDs (userId, orderId, etc.)
2. **Use Appropriate Levels**: Use correct log levels (warn for warnings, error for errors)
3. **Category Specific**: Use category-specific log functions for better organization
4. **Performance Aware**: Don't log sensitive data (passwords, full credit cards)
5. **Structured Logging**: Use JSON format for easy parsing and analysis
6. **Regular Cleanup**: Implement log rotation to prevent disk space issues
7. **Monitoring**: Set up alerts for fatal.log and auth.log with failed attempts

---

## Troubleshooting

### Issue: Log files not being created

- Check if `logs/` directory has write permissions
- Verify `ENABLE_FILE_LOGGING=true` in .env
- Check logger initialization in app startup

### Issue: Log files growing too large

- Reduce `LOG_MAX_FILE_SIZE` in .env
- Increase max files retention or implement log cleanup job
- Lower `LOG_LEVEL` to reduce verbosity

### Issue: Performance or disk space concerns

- Disable unnecessary categories (e.g., `LOG_HTTP_ENABLED=false`)
- Reduce max files for less critical logs
- Implement log archival strategy

---

## Summary Table

| File            | Level  | Purpose            | Retention | Use Case           |
| --------------- | ------ | ------------------ | --------- | ------------------ |
| combined.log    | ALL    | Main aggregate log | 10 files  | General monitoring |
| error.log       | ERROR+ | Critical errors    | 5 files   | Error diagnosis    |
| fatal.log       | FATAL  | System failures    | 10 files  | Critical issues    |
| warn.log        | WARN   | Warnings           | 5 files   | Potential issues   |
| debug.log       | DEBUG+ | Development info   | 10 files  | Debugging          |
| info.log        | INFO   | General info       | 5 files   | App events         |
| http.log        | all    | API requests       | 10 files  | Traffic analysis   |
| database.log    | all    | DB operations      | 10 files  | Query performance  |
| auth.log        | all    | Auth events        | 15 files  | Security audit     |
| performance.log | all    | Perf metrics       | 10 files  | SLA monitoring     |
| payment.log     | all    | Transactions       | 20 files  | Reconciliation     |
