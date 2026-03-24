import { logger, logError } from "../utils/logger.js";
import config from "../config/environment.config.js";

/**
 * Helper to extract module name from stack trace
 */
const extractModule = (stack) => {
  if (!stack) return null;
  const match = stack.match(/\(([^)]*src[^)]*)\)/);
  if (match && match[1]) {
    const moduleMatch = match[1].match(/src\/modules\/(\w+)/);
    if (moduleMatch) return moduleMatch[1];
    const fileMatch = match[1].match(/src\/config\/(\w+)|src\/(\w+)\//);
    if (fileMatch) return fileMatch[1] || fileMatch[2];
  }
  return null;
};

/**
 * Enhanced Global Error Handler Middleware
 * Should be the last middleware in the app
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];
  const module = err.module || extractModule(err.stack);

  // Log error with structured format including module information
  logError(`[${req.method} ${req.path}] Error encountered`, err, {
    module,
    statusCode,
    errors,
    body: config.app.isDevelopment
      ? req.body
      : { note: "hidden in production" },
  });

  // Handle specific error types
  if (err.name === "MongooseError") {
    statusCode = 400;
    message = "Database validation error";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    statusCode = 409;
    message = `${field} already exists`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Send error response
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(module && { module }), // Include module in response for debugging
    errors: config.app.isDevelopment ? errors : [],
    ...(config.app.isDevelopment && { stack: err.stack }),
  });
};

export default errorHandler;
