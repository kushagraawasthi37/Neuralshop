import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/environment.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define custom log levels with enhanced colors and symbols
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: "bold red", // Bright red for fatal errors
    error: "red", // Standard red for errors
    warn: "bold yellow", // Bold yellow for warnings
    info: "bold cyan", // Bold cyan for info (better contrast)
    debug: "bold magenta", // Bold magenta for debug
    trace: "gray", // Gray for trace
  },
};

// Log level symbols for visual distinction
const logSymbols = {
  fatal: "💀",
  error: "❌",
  warn: "⚠️ ",
  info: "ℹ️ ",
  debug: "🐛",
  trace: "📍",
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");

// Helper function to format metadata with better visual structure
const formatMetadata = (meta) => {
  // Filter out default service metadata
  const filteredMeta = Object.fromEntries(
    Object.entries(meta).filter(
      ([key, value]) =>
        key !== "service" && value !== null && value !== undefined,
    ),
  );

  if (Object.keys(filteredMeta).length === 0) return "";

  let formatted = "\n";

  for (const [key, value] of Object.entries(filteredMeta)) {
    const formattedKey = `\x1b[36m${key}\x1b[0m`; // Cyan color for keys

    if (typeof value === "object" && value !== null) {
      // Format nested objects/arrays with indentation
      const jsonStr = JSON.stringify(value, null, 2)
        .split("\n")
        .map((line, idx) => (idx === 0 ? line : "    " + line))
        .join("\n");
      formatted += `    ${formattedKey}: ${jsonStr}\n`;
    } else if (typeof value === "string" && value.length > 50) {
      // Truncate long strings
      formatted += `    ${formattedKey}: ${value.substring(0, 50)}...\n`;
    } else {
      formatted += `    ${formattedKey}: \x1b[33m${value}\x1b[0m\n`; // Yellow for values
    }
  }

  return formatted;
};

// Define a custom printf format for better readability
const customPrintf = ({ timestamp, level, message, ...meta }) => {
  const symbol = logSymbols[level] || "•";
  const padding = level.padEnd(7, " "); // Pad level name to 7 chars for alignment
  const metaStr = formatMetadata(meta);

  return `${symbol} ${timestamp} [\x1b[90m${padding}\x1b[0m] ${message}${metaStr}`;
};

// Console format with colors and better structure
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(customPrintf),
);

// File format - structured JSON for better parsing
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Create logger
export const logger = winston.createLogger({
  levels: customLevels.levels,
  format: fileFormat,
  defaultMeta: { service: "neural-shop-backend" },
  transports: [
    // Console transport with enhanced formatting
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    }),

    // ===== ERROR LOGGING =====
    // Fatal errors only
    new winston.transports.File({
      filename: path.join(logsDir, "fatal.log"),
      level: "fatal",
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: fileFormat,
    }),

    // Error level logs (errors and above)
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),

    // ===== WARNING LOGGING =====
    new winston.transports.File({
      filename: path.join(logsDir, "warn.log"),
      level: "warn",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),

    // ===== DEBUG LOGGING =====
    new winston.transports.File({
      filename: path.join(logsDir, "debug.log"),
      level: "debug",
      maxsize: 10485760, // 10MB (larger for debug details)
      maxFiles: 10,
      format: fileFormat,
    }),

    // ===== INFO LOGGING =====
    new winston.transports.File({
      filename: path.join(logsDir, "info.log"),
      level: "info",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),

    // ===== COMBINED LOGGING =====
    // All log levels in one file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: fileFormat,
    }),

    // ===== DOMAIN-SPECIFIC LOGGING =====
    // HTTP/API Request logs
    new winston.transports.File({
      filename: path.join(logsDir, "http.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.json(),
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),

    // Database operation logs
    new winston.transports.File({
      filename: path.join(logsDir, "database.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.json(),
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),

    // Authentication/Authorization logs
    new winston.transports.File({
      filename: path.join(logsDir, "auth.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 15, // Keep more auth logs for security auditing
    }),

    // Performance monitoring logs
    new winston.transports.File({
      filename: path.join(logsDir, "performance.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.json(),
      ),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),

    // Payment transaction logs
    new winston.transports.File({
      filename: path.join(logsDir, "payment.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 20, // Keep more payment logs for reconciliation
    }),
  ],
});

// Add colors to Winston
winston.addColors(customLevels.colors);

/**
 * Helper function to extract module name from stack trace
 * Extracts from file paths like: "src/modules/auth/auth.service.js"
 */
const extractModuleFromStack = (stack) => {
  if (!stack) return null;

  const match = stack.match(/\(([^)]*src[^)]*)\)/);
  if (match && match[1]) {
    const filePath = match[1];
    // Extract module name from path like src/modules/auth/auth.service.js
    const moduleMatch = filePath.match(/src\/modules\/(\w+)/);
    if (moduleMatch) return moduleMatch[1];

    // Fallback: extract filename
    const fileMatch = filePath.match(/([^/\\]+\.js)$/);
    if (fileMatch) return fileMatch[1];
  }

  return null;
};

/**
 * Convenience methods for common logging patterns
 */
export const logStartup = (message, details = {}) => {
  logger.info(`🚀 ${message}`, details);
};

export const logDatabase = (message, details = {}) => {
  logger.info(`🗄️  ${message}`, { ...details, category: "database" });
};

export const logRequest = (method, path, statusCode, details = {}) => {
  logger.info(`→ ${method} ${path} [${statusCode}]`, {
    ...details,
    category: "http",
  });
};

// ===== DOMAIN-SPECIFIC LOGGING HELPERS =====

/**
 * Log HTTP/API requests with detailed info
 * @param {Object} params - Request details
 */
export const logHttpRequest = (params = {}) => {
  const { method, path, statusCode, duration, userId, ipAddress, userAgent } =
    params;
  logger.info(`HTTP ${method} ${path}`, {
    statusCode,
    duration: `${duration}ms`,
    userId,
    ipAddress,
    userAgent,
    category: "http",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log database operations
 * @param {Object} params - Database operation details
 */
export const logDatabaseOperation = (params = {}) => {
  const { operation, collection, duration, query, result } = params;
  logger.info(`DB ${operation.toUpperCase()} ${collection}`, {
    operation,
    collection,
    duration: `${duration}ms`,
    query,
    result,
    category: "database",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log authentication events
 * @param {Object} params - Authentication details
 */
export const logAuthEvent = (params = {}) => {
  const { event, userId, email, ipAddress, status, reason } = params;
  logger.info(`AUTH ${event.toUpperCase()}`, {
    event,
    userId,
    email,
    ipAddress,
    status,
    reason,
    category: "auth",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log performance metrics
 * @param {Object} params - Performance data
 */
export const logPerformance = (params = {}) => {
  const { operation, duration, service, threshold } = params;
  const level = duration > threshold ? "warn" : "info";
  logger[level](`PERF ${operation}`, {
    operation,
    duration: `${duration}ms`,
    service,
    threshold: `${threshold}ms`,
    category: "performance",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log payment transactions
 * @param {Object} params - Payment details
 */
export const logPaymentTransaction = (params = {}) => {
  const { orderId, userId, amount, currency, status, provider, txnId } = params;
  logger.info(`PAYMENT ${status}`, {
    orderId,
    userId,
    amount,
    currency,
    status,
    provider,
    txnId,
    category: "payment",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API errors with module context
 * @param {Object} params - Error details
 */
export const logError = (message, error = null, details = {}) => {
  let module = details.module || null;

  if (error instanceof Error) {
    // Try to extract module from error (if set via ApiError)
    if (error.module) {
      module = error.module;
    } else {
      // Extract module from stack trace
      module = module || extractModuleFromStack(error.stack);
    }

    const errorDetails = {
      ...(module && { module: `📦 ${module}` }), // Add module icon
      stack: error.stack,
      ...details,
    };

    logger.error(`${message}: ${error.message}`, errorDetails);
  } else {
    const errorDetails = {
      ...(module && { module: `📦 ${module}` }),
      ...details,
    };
    logger.error(message, errorDetails);
  }
};

export default logger;
