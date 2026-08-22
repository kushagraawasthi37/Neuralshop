import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Custom levels (kept identical to original so existing callsites work) ────
const customLevels = {
  levels: { fatal: 0, error: 1, warn: 2, info: 3, http: 4, debug: 5, trace: 6 },
  colors: {
    fatal: "bold red",
    error: "red",
    warn: "bold yellow",
    info: "bold cyan",
    http: "bold green",
    debug: "bold magenta",
    trace: "gray",
  },
};

winston.addColors(customLevels.colors);

// ─── Fields that must never appear in logs ─────────────────────────────────
const SENSITIVE_KEYS = new Set([
  "password", "confirmPassword", "newPassword", "oldPassword",
  "token", "accessToken", "refreshToken", "userToken", "adminToken",
  "authorization", "Authorization",
  "cardNumber", "cvv", "expiryDate",
  "jwt", "secret", "apiKey", "apiSecret",
  "razorpay_payment_id", "razorpay_signature",
]);

const sanitize = (obj, depth = 0) => {
  if (depth > 6 || obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => sanitize(v, depth + 1));

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.has(k) ? "[REDACTED]" : sanitize(v, depth + 1),
    ]),
  );
};

// Winston format that runs sanitization before any transport sees the log
const sanitizeFormat = winston.format((info) => {
  if (info.body) info.body = sanitize(info.body);
  if (info.headers) {
    const { authorization, cookie, ...safe } = info.headers;
    info.headers = safe;
  }
  return info;
})();

// ─── Formats ──────────────────────────────────────────────────────────────
const logsDir = path.join(__dirname, "../../logs");

const logSymbols = {
  fatal: "💀", error: "❌", warn: "⚠️ ", info: "ℹ️ ", http: "🌐", debug: "🐛", trace: "📍",
};

const formatMetadata = (meta) => {
  const filtered = Object.fromEntries(
    Object.entries(meta).filter(([k, v]) => k !== "service" && v != null),
  );
  if (!Object.keys(filtered).length) return "";

  return (
    "\n" +
    Object.entries(filtered)
      .map(([k, v]) => {
        const key = `\x1b[36m${k}\x1b[0m`;
        if (typeof v === "object") {
          const json = JSON.stringify(v, null, 2)
            .split("\n")
            .map((l, i) => (i === 0 ? l : "    " + l))
            .join("\n");
          return `    ${key}: ${json}`;
        }
        const val = String(v);
        return `    ${key}: \x1b[33m${val.length > 100 ? val.slice(0, 100) + "…" : val}\x1b[0m`;
      })
      .join("\n") +
    "\n"
  );
};

const devPrintf = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const symbol = logSymbols[level] || "•";
  return `${symbol} ${timestamp} [\x1b[90m${level.padEnd(5)}\x1b[0m] ${message}${formatMetadata(meta)}`;
});

const devFormat = winston.format.combine(
  sanitizeFormat,
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(devPrintf._transform),
);

// Plain dev format without colorize for printf to work right
const consoleFmt = winston.format.combine(
  sanitizeFormat,
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  devPrintf,
);

const fileFmt = winston.format.combine(
  sanitizeFormat,
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// ─── Transports ──────────────────────────────────────────────────────────
const isDev = (process.env.NODE_ENV || "development") !== "production";

const transports = [
  ...(process.env.ENABLE_CONSOLE_LOGGING === "false" ? [] : [new winston.transports.Console({
    format: consoleFmt,
    level: process.env.LOG_LEVEL || "debug",
  })]),
  new DailyRotateFile({
    filename: path.join(logsDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxSize: "10m",
    maxFiles: "14d",
    format: fileFmt,
    zippedArchive: true,
  }),
  new DailyRotateFile({
    filename: path.join(logsDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "7d",
    format: fileFmt,
    zippedArchive: true,
  }),
];

// ─── Logger instance ─────────────────────────────────────────────────────
export const logger = winston.createLogger({
  levels: customLevels.levels,
  defaultMeta: { service: "neural-shop-backend" },
  transports,
  // never crash the process on logger errors
  exitOnError: false,
});

// ─── Correlation ID support ───────────────────────────────────────────────
export const createRequestLogger = (requestId) =>
  logger.child({ requestId });

// ─── Convenience helpers (backward-compatible with existing callsites) ────
export const logStartup = (message, details = {}) =>
  logger.info(`🚀 ${message}`, details);

export const logDatabase = (message, details = {}) =>
  logger.info(`🗄️  ${message}`, { ...details, category: "database" });

export const logRequest = (method, path, statusCode, details = {}) =>
  logger.http(`→ ${method} ${path} [${statusCode}]`, {
    ...details,
    category: "http",
  });

export const logHttpRequest = ({ method, path, statusCode, duration, userId, ipAddress, userAgent } = {}) =>
  logger.http(`HTTP ${method} ${path}`, {
    statusCode, duration: `${duration}ms`, userId, ipAddress, userAgent, category: "http",
  });

export const logDatabaseOperation = ({ operation, collection, duration, query, result } = {}) =>
  logger.info(`DB ${String(operation).toUpperCase()} ${collection}`, {
    operation, collection, duration: `${duration}ms`, query, result, category: "database",
  });

export const logAuthEvent = ({ event, userId, email, ipAddress, status, reason } = {}) =>
  logger.info(`AUTH ${String(event).toUpperCase()}`, {
    event, userId, email, ipAddress, status, reason, category: "auth",
  });

export const logPerformance = ({ operation, duration, service, threshold } = {}) => {
  const level = duration > threshold ? "warn" : "info";
  logger[level](`PERF ${operation}`, {
    operation, duration: `${duration}ms`, service, threshold: `${threshold}ms`, category: "performance",
  });
};

export const logPaymentTransaction = ({ orderId, userId, amount, currency, status, provider, txnId } = {}) =>
  logger.info(`PAYMENT ${status}`, {
    orderId, userId, amount, currency, status, provider, txnId, category: "payment",
  });

export const logError = (message, error = null, details = {}) => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`, { stack: error.stack, ...details });
  } else {
    logger.error(message, details);
  }
};

// Named export and default export — keep both so any `import logger from` still works
export default logger;
