import { logger } from "../utils/logger.js";
import config from "../config/environment.config.js";

// ─── Global Error Handler ─────────────────────────────────────────────────
// Must be the LAST middleware (4-argument signature).
//
// Why separate operational vs programmer errors:
//   Operational → bad input, not-found, auth failure   → safe to log+return JSON
//   Programmer  → null dereference, misconfiguration   → log full stack, maybe restart

const isProd = config.app.isProduction;

// ── Prisma error normalization ──────────────────────────────────────────
const handlePrismaError = (err) => {
  // P2002 = unique constraint violation
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] ?? "field";
    return { statusCode: 409, message: `${field} already exists` };
  }
  // P2025 = record not found (findUniqueOrThrow etc.)
  if (err.code === "P2025") {
    return { statusCode: 404, message: err.meta?.cause ?? "Record not found" };
  }
  // P2003 = foreign key constraint
  if (err.code === "P2003") {
    return { statusCode: 400, message: "Related record not found" };
  }
  return null;
};

// ── Mongoose error normalization ────────────────────────────────────────
const handleMongooseError = (err) => {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return { statusCode: 400, message: "Validation error", errors };
  }
  if (err.name === "CastError") {
    return { statusCode: 400, message: `Invalid ${err.path}: ${err.value}` };
  }
  // Mongo duplicate key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
    return { statusCode: 409, message: `${field} already exists` };
  }
  return null;
};

// ── JWT error normalization ─────────────────────────────────────────────
const handleJwtError = (err) => {
  if (err.name === "JsonWebTokenError") {
    return { statusCode: 401, message: "Invalid token. Please log in again." };
  }
  if (err.name === "TokenExpiredError") {
    return { statusCode: 401, message: "Token expired. Please log in again." };
  }
  return null;
};

// ── Multer error normalization ──────────────────────────────────────────
const handleMulterError = (err) => {
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return { statusCode: 413, message: "File too large" };
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return { statusCode: 400, message: `Unexpected file field: ${err.field}` };
    }
    return { statusCode: 400, message: err.message };
  }
  return null;
};

// ── Main handler ────────────────────────────────────────────────────────
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? "Internal Server Error";
  let errors = err.errors ?? [];
  const isOperational = err.isOperational ?? false;

  // Try each normalizer in order
  const normalized =
    handlePrismaError(err) ||
    handleMongooseError(err) ||
    handleJwtError(err) ||
    handleMulterError(err);

  if (normalized) {
    statusCode = normalized.statusCode;
    message = normalized.message;
    errors = normalized.errors ?? errors;
  }

  // Log level based on severity
  const logMeta = {
    requestId: res.locals.requestId,
    statusCode,
    method: req.method,
    path: req.path,
    isOperational,
    ...(isProd ? {} : { stack: err.stack, body: req.body }),
  };

  if (statusCode >= 500 || !isOperational) {
    logger.error(`[${req.method} ${req.path}] ${message}`, logMeta);
  } else {
    logger.warn(`[${req.method} ${req.path}] ${message}`, logMeta);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors.length ? { errors } : {}),
    // Never leak stack traces in production
    ...(isProd ? {} : { stack: err.stack }),
  });
};

export default errorHandler;
