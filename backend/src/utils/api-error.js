// Backward-compat shim — all callers use ApiError; AppError is the canonical class.
export { AppError as ApiError, AppError } from "./AppError.js";
export { AppError as default } from "./AppError.js";
