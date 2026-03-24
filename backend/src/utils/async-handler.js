import { logger } from "./logger.js";
import { ApiError } from "./api-error.js";

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: router.post('/endpoint', asyncHandler(controller.method))
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error("Async handler error:", {
        error: err.message,
        stack: err.stack,
      });
      next(err);
    });
  };
};

export default asyncHandler;
