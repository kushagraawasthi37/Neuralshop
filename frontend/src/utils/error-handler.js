import { MESSAGES, HTTP_STATUS } from "../constants/messages.js";

/**
 * Error handler utility for consistent error handling across the application
 */
export class AppError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Handle API errors and return user-friendly messages
 * @param {Error} error - The error object from API call
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  // Network error
  if (!error.response) {
    return MESSAGES.ERROR.NETWORK;
  }

  const { status, data } = error.response;

  // Handle specific HTTP status codes
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return data?.message || MESSAGES.ERROR.VALIDATION;

    case HTTP_STATUS.UNAUTHORIZED:
      return data?.message || MESSAGES.ERROR.UNAUTHORIZED;

    case HTTP_STATUS.FORBIDDEN:
      return data?.message || MESSAGES.ERROR.FORBIDDEN;

    case HTTP_STATUS.NOT_FOUND:
      return data?.message || MESSAGES.ERROR.NOT_FOUND;

    case HTTP_STATUS.CONFLICT:
      return data?.message || MESSAGES.ERROR.EMAIL_EXISTS;

    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      // Handle validation errors
      if (data?.errors && Array.isArray(data.errors)) {
        return data.errors.map((err) => err.message).join(", ");
      }
      return data?.message || MESSAGES.ERROR.VALIDATION;

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    default:
      return data?.message || MESSAGES.ERROR.GENERIC;
  }
};

/**
 * Handle form validation errors
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted error messages
 */
export const handleValidationErrors = (errors) => {
  const formattedErrors = {};

  Object.keys(errors).forEach((field) => {
    const error = errors[field];
    if (error?.message) {
      formattedErrors[field] = error.message;
    } else if (Array.isArray(error)) {
      formattedErrors[field] = error[0];
    } else if (typeof error === "string") {
      formattedErrors[field] = error;
    }
  });

  return formattedErrors;
};

/**
 * Create a standardized error object for forms
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @returns {Object} Error object
 */
export const createFieldError = (field, message) => ({
  [field]: { message },
});

/**
 * Log errors for debugging (only in development)
 * @param {Error} error - Error to log
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = "") => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}] Error:`, {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      details: error.details,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handle async errors in components
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that handles errors
 */
export const withErrorHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, "withErrorHandler");
      throw error;
    }
  };
};

/**
 * Check if error is a network error
 * @param {Error} error - Error to check
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return !error.response;
};

/**
 * Check if error is an authentication error
 * @param {Error} error - Error to check
 * @returns {boolean} True if auth error
 */
export const isAuthError = (error) => {
  return error.response?.status === HTTP_STATUS.UNAUTHORIZED;
};

/**
 * Check if error is a validation error
 * @param {Error} error - Error to check
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
  return (
    error.response?.status === HTTP_STATUS.BAD_REQUEST ||
    error.response?.status === HTTP_STATUS.UNPROCESSABLE_ENTITY
  );
};

/**
 * Get error message for toast notifications
 * @param {Error} error - Error object
 * @returns {string} Toast message
 */
export const getToastErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return MESSAGES.ERROR.NETWORK;
  }

  if (isAuthError(error)) {
    return MESSAGES.ERROR.UNAUTHORIZED;
  }

  return handleApiError(error);
};
