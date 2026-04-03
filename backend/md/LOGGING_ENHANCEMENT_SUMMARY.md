# Enhanced Logging System - Summary of Changes

## Overview

The logging system has been significantly enhanced to support 11 different log files for comprehensive debugging, monitoring, and auditing of your NeuralShop backend.

## 📁 New Log Files Created

### By Category:

**Severity-Based Logs:**

- ✅ `fatal.log` - Critical system failures only
- ✅ `error.log` - All errors (5MB, 5 files retention)
- ✅ `warn.log` - Warning-level messages (5MB, 5 files)
- ✅ `debug.log` - Debug messages (10MB, 10 files)
- ✅ `info.log` - Informational messages (5MB, 5 files)
- ✅ `combined.log` - All messages (10MB, 10 files)

**Domain-Specific Logs:**

- ✅ `http.log` - API request/response tracking (10MB, 10 files)
- ✅ `database.log` - Database operations (10MB, 10 files)
- ✅ `auth.log` - Authentication/Security events (5MB, 15 files for audit trail)
- ✅ `performance.log` - Slow query/operation detection (10MB, 10 files)
- ✅ `payment.log` - Financial transactions (5MB, 20 files for compliance)

## 🔧 Code Updates

### 1. **logger.js** - Enhanced with:

**New Log Transports (11 total):**

```javascript
// Now includes separate file transports for:
- fatal.log (fatal errors only)
- error.log (errors + fatal)
- warn.log (warnings)
- debug.log (debug + trace)
- info.log (informational)
- combined.log (all levels)
- http.log (API requests)
- database.log (DB operations)
- auth.log (authentication/security)
- performance.log (performance metrics)
- payment.log (transactions)
```

**New Helper Functions (7 specialized logging functions):**

```javascript
✅ logHttpRequest(params)      // Log API requests with metadata
✅ logDatabaseOperation(params) // Log DB queries and performance
✅ logAuthEvent(params)         // Log auth/security events
✅ logPerformance(params)       // Log slow operations/performance
✅ logPaymentTransaction(params) // Log payment transactions
✅ logError(message, error)     // Already existed, still available
✅ logStartup(message)          // Already existed, still available
```

### 2. **environment.config.js** - Enhanced with:

**New Configuration Object:**

```javascript
logging: {
  level: string,                 // Log level (debug, info, warn, error, fatal)
  enableFileLogging: boolean,    // Toggle file logging
  enableConsoleLogging: boolean, // Toggle console output

  maxFileSize: int,              // KB before rotation
  maxFiles: int,                 // Files to keep per log type

  categories: {
    http: { enabled, maxFiles },
    database: { enabled, maxFiles },
    auth: { enabled, maxFiles },
    performance: { enabled, maxFiles, threshold },
    payment: { enabled, maxFiles }
  }
}
```

### 3. **.env.example** - Updated with:

**New Environment Variables:**

```env
# File Rotation
LOG_MAX_FILE_SIZE=5242880      # 5MB per file
LOG_MAX_FILES=5                # Number of files to keep

# Category-Specific Settings
LOG_HTTP_ENABLED=true
LOG_HTTP_MAX_FILES=10
LOG_DATABASE_ENABLED=true
LOG_DB_MAX_FILES=10
LOG_AUTH_ENABLED=true
LOG_AUTH_MAX_FILES=15
LOG_PERFORMANCE_ENABLED=true
LOG_PERF_MAX_FILES=10
LOG_PERF_THRESHOLD_MS=1000     # Alert if operation > 1 second
LOG_PAYMENT_ENABLED=true
LOG_PAYMENT_MAX_FILES=20
```

## 📚 Documentation

### New File: `LOGGING_FILES_GUIDE.md`

Comprehensive guide covering:

- All 11 log files with examples
- When and how to use each helper function
- Real-world usage examples
- Configuration options
- Log analysis tips and bash commands
- Best practices
- Troubleshooting guide
- Summary table of all files

## 🎯 Quick Start Usage

### Log HTTP Request:

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

### Log Database Operation:

```javascript
import { logDatabaseOperation } from "../utils/logger.js";

const start = Date.now();
const products = await Product.find();

logDatabaseOperation({
  operation: "find",
  collection: "products",
  duration: Date.now() - start,
  query: {},
  result: `${products.length} items found`,
});
```

### Log Authentication:

```javascript
import { logAuthEvent } from "../utils/logger.js";

logAuthEvent({
  event: "login_success",
  userId: user._id,
  email: user.email,
  ipAddress: req.ip,
  status: "success",
});
```

### Log Payment Transaction:

```javascript
import { logPaymentTransaction } from "../utils/logger.js";

logPaymentTransaction({
  orderId: order._id,
  userId: userId,
  amount: 500,
  currency: "INR",
  status: "success",
  provider: "razorpay",
  txnId: "pay_123456",
});
```

## 📊 File Rotation Details

| Log File        | Size Limit | Files Kept | Purpose           |
| --------------- | ---------- | ---------- | ----------------- |
| fatal.log       | 5MB        | 10         | Critical failures |
| error.log       | 5MB        | 5          | Error diagnosis   |
| warn.log        | 5MB        | 5          | Warnings          |
| debug.log       | 10MB       | 10         | Debugging         |
| info.log        | 5MB        | 5          | General info      |
| combined.log    | 10MB       | 10         | All logs          |
| http.log        | 10MB       | 10         | API traffic       |
| database.log    | 10MB       | 10         | DB operations     |
| auth.log        | 5MB        | **15**     | Security audit    |
| performance.log | 10MB       | 10         | Perf metrics      |
| payment.log     | 5MB        | **20**     | Transactions      |

**Note:** Auth logs keep more files for security audit trails, and payment logs keep more for financial compliance.

## 🔍 Monitoring Commands

### View real-time errors:

```bash
tail -f logs/error.log
```

### View authentication attempts:

```bash
tail -f logs/auth.log
```

### Find slow database queries:

```bash
grep "duration" logs/database.log | grep -E "[0-9]{3,}ms"
```

### Find failed payments:

```bash
grep "failed\|Failed" logs/payment.log
```

### Monitor performance issues:

```bash
tail -f logs/performance.log | grep "PERF"
```

## ✅ What's Included

- ✅ 11 specialized log files
- ✅ Automatic file rotation
- ✅ 7 helper functions for common logging patterns
- ✅ Centralized config for all logging settings
- ✅ Environment variables for fine-tuned control
- ✅ Performance thresholds for auto-alerting
- ✅ Security-focused auth logging (15 file retention)
- ✅ Financial compliance payment logging (20 file retention)
- ✅ Comprehensive documentation with examples

## 🎉 Benefits

1. **Better Debugging** - Categorized logs make it easy to find issues
2. **Security Auditing** - Auth logs keep detailed security trail
3. **Performance Monitoring** - Track slow operations automatically
4. **Financial Compliance** - Payment logs with maximum retention
5. **Reduced Log Noise** - Separate files prevent cluttered logs
6. **Easy Analysis** - Category-specific logs for quick diagnosis
7. **Professional** - Production-grade logging system
8. **Flexible Configuration** - Enable/disable categories as needed

## 📝 Next Steps

1. Review `LOGGING_FILES_GUIDE.md` for detailed information
2. Update your modules to use the new helper functions
3. Configure .env with your desired logging settings
4. Monitor the logs directory for activity
5. Set up log shipping/backup for production

## 🔗 Related Files

- `src/utils/logger.js` - Logger configuration and helpers
- `src/config/environment.config.js` - Logging configuration
- `.env.example` - Environment variables
- `LOGGING_FILES_GUIDE.md` - Complete documentation
- `LOGGING_GUIDE.md` - Original logging guide (still relevant)
