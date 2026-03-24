import { validationResult } from "express-validator";
import { logger } from "../utils/logger.js";

/**
 * Validation error handler middleware
 * Extracts validation errors and returns formatted response
 */
export const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn("Validation error", {
      path: req.path,
      method: req.method,
      errors: errors.array(),
    });

    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors: formattedErrors,
      data: null,
    });
  }

  next();
};

export default validationErrorHandler;
