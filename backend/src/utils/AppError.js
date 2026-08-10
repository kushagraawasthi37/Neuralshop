// ─── AppError ──────────────────────────────────────────────────────────────
// Centralised operational error class.
// isOperational = true  → expected failure (bad input, not found, auth fail)
//                         → log as warning, return structured JSON
// isOperational = false → programmer bug (unhandled edge case, misconfiguration)
//                         → log as error, consider process restart

export class AppError extends Error {
  constructor(message, statusCode = 500, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.success = false;
    this.data = null;
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory helpers so controllers stay readable ──
  static badRequest(message, errors = []) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(resource = "Resource") {
    return new AppError(`${resource} not found`, 404);
  }

  static conflict(message) {
    return new AppError(message, 409);
  }

  static tooManyRequests(message = "Too many requests") {
    return new AppError(message, 429);
  }

  static internal(message = "Internal Server Error") {
    return new AppError(message, 500, [], false);
  }
}

// Keep ApiError as an alias so old imports still compile
export const ApiError = AppError;

export default AppError;
