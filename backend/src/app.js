// NOTE: dotenv.config() is called in server.js before importing this module
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import compression from "compression";

import connectDB from "./config/db.js";
import { createProductIndex } from "./modules/product/elasticsearch.service.js";
import { setupRoutes } from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import requestLogger from "./middlewares/requestLogger.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import { logger } from "./utils/logger.js";
import config from "./config/environment.config.js";

const app = express();

// ─── 1. Compression ────────────────────────────────────────────────────────
// Skip webhook and uploads (raw/multipart bodies) — compressing them wastes CPU.
app.use(compression({
  level: 6,
  threshold: 1024, //1KB
  filter: (req, res) => {
    if (req.path === "/webhook") return false;
    if (req.headers["content-type"]?.includes("multipart")) return false;
    return compression.filter(req, res);
  },
}));

// ─── 2. Security headers ──────────────────────────────────────────────────
// Helmet sets 11 security headers in one call (X-Frame-Options, HSTS, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // Allow Razorpay checkout script
        "https://checkout.razorpay.com",
        "https://api.razorpay.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: [
        "'self'",
        config.frontend.userUrl,
        config.frontend.adminUrl,
        "https://api.razorpay.com",
      ],
      frameSrc: ["https://api.razorpay.com"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ─── 3. CORS ──────────────────────────────────────────────────────────────
// Allowlist-only origins with credentials. This is paired with SameSite=None on
// cookies so cross-origin cookie delivery works in the browser.
app.use(cors({
  origin: (origin, cb) => {
    const allowed = new Set(config.cors.origin);
    // Allow non-browser tools (Postman, curl) in dev; in prod require an origin
    if (!origin || allowed.has(origin) || config.app.isDevelopment) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: [...config.cors.allowedHeaders, "Idempotency-Key", "X-Request-Id"],
}));

// ─── 4. Webhook route — raw body parser BEFORE express.json() ─────────────
// Razorpay signature verification requires the *exact* raw bytes.
// express.json() would parse them and the HMAC check would fail.
app.use("/webhook", express.raw({ type: "application/json" }));

// ─── 5. Body parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
// This middleware tells Express to parse data sent from HTML forms
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── 6. NoSQL injection prevention ────────────────────────────────────────
// Strips { $where, $gt, … } operators from req.body / req.query / req.params
// before they reach Mongoose. Stops "admin" OR "1"="1" style Mongo injection.
app.use(mongoSanitize({ replaceWith: "_" }));

// ─── 7. HTTP Parameter Pollution protection ───────────────────────────────
// Prevents ?role=user&role=admin from producing an array that breaks downstream
// logic. HPP keeps the *last* value and exposes the duplicates in req.queryPolluted.
app.use(hpp({
  whitelist: ["sort", "category", "size", "price"],
}));

// ─── 8. Correlation ID + structured request logger ────────────────────────
app.use(requestLogger);

// ─── 9. Global API rate limiter ───────────────────────────────────────────
// Route-specific limiters (auth, OTP, payment) are applied at the router level.
app.use("/api", apiLimiter);

// ─── 10. Connect DB and seed Elasticsearch ────────────────────────────────
connectDB();
createProductIndex();

// ─── 11. Application routes ───────────────────────────────────────────────
setupRoutes(app);

// ─── 12. 404 catch-all ────────────────────────────────────────────────────
app.use((req, res) => {
  logger.warn("Route not found", {
    method: req.method,
    path: req.path,
    requestId: res.locals.requestId,
  });
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

// ─── 13. Global error handler (must be last) ──────────────────────────────
app.use(errorHandler);

export default app;
