// Re-export from utils/logger.js so both import paths work
// backend/src/config/logger.js  ←  new canonical location per spec
// backend/src/utils/logger.js   ←  kept for backward-compat (all existing imports still work)
export * from "../utils/logger.js";
export { default } from "../utils/logger.js";
