// Custom Error Class with module/service tracking
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], module = null, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.module = module; // Track which module/service threw the error

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
