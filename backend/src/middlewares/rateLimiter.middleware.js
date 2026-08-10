import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

// ─── Why Redis store (not the default in-memory store) ───────────────────────
// The in-memory store is per-process. PM2 cluster mode runs N processes;
// each has its own counter. An attacker can send N×limit requests before
// being blocked. Redis is the single source of truth across all processes.

const makeStore = () => {
  try {
    return new RedisStore({
      // rate-limit-redis v4+ uses sendCommand
      sendCommand: (...args) => redisClient.call(...args),
      prefix: "rl:",
    });
  } catch {
    logger.warn("RedisStore unavailable, falling back to memory store for rate limiting");
    return undefined; // express-rate-limit falls back to MemoryStore
  }
};

// ─── Shared handler for 429 responses ────────────────────────────────────
const onLimitReached = (req, res) => {
  logger.warn("Rate limit exceeded", {
    ip: req.ip,
    path: req.path,
    requestId: res.locals.requestId,
    category: "security",
  });
};

// ─── Auth limiter — 5 req / 15 min / IP ──────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,   // Retry-After in RateLimit-* headers (RFC 6585)
  legacyHeaders: false,
  store: makeStore(),
  handler(req, res) {
    onLimitReached(req, res);
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many attempts. Please try again in 15 minutes.",
    });
  },
});

// ─── OTP limiter — 3 req / 10 min / IP ───────────────────────────────────
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  handler(req, res) {
    onLimitReached(req, res);
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many OTP requests. Please wait 10 minutes.",
    });
  },
});

// ─── Payment limiter — 10 req / min / IP ─────────────────────────────────
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  handler(req, res) {
    onLimitReached(req, res);
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many payment requests. Please slow down.",
    });
  },
});

// ─── General API limiter — 100 req / min / IP ────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore(),
  handler(req, res) {
    onLimitReached(req, res);
    res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many requests. Please slow down.",
    });
  },
  // Skip Razorpay webhook — it hits the server in bursts during reconciliation
  skip: (req) => req.path === "/webhook",
});
