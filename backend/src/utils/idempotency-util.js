import redisClient from "../config/redis.js";
import { logger } from "./logger.js";
import crypto from "crypto";

// ─── Idempotency middleware ───────────────────────────────────────────────
// Prevents duplicate submissions (double-click checkout, network retry) by
// caching the first response against a client-generated UUID key for 24 h.
//
// Why 24 h not 48 h for the cache: if the client retries the same action
// more than 24 h later it's almost certainly intentional, not a duplicate.

const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

const requestFingerprint = (req) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify({ method: req.method, path: req.originalUrl, body: req.body ?? {} }))
    .digest("hex");

export const checkIdempotency = async (req, res, next) => {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) return next();

  const redisKey = `idempotency:${idempotencyKey}`;
  const fingerprint = requestFingerprint(req);

  try {
    const cached = await redisClient.get(redisKey);
    if (cached) {
      logger.debug("Idempotency cache hit", {
        idempotencyKey,
        requestId: res.locals.requestId,
      });
      const cachedResponse = JSON.parse(cached);
      if (cachedResponse.fingerprint && cachedResponse.fingerprint !== fingerprint) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: "Idempotency key cannot be reused with a different request",
        });
      }
      const { statusCode, data } = cachedResponse;
      return res.status(statusCode).json(data);
    }

    logger.debug("Idempotency cache miss", {
      idempotencyKey,
      requestId: res.locals.requestId,
    });

    const originalSend = res.send;
    res.send = function (data) {
      // Only cache successful responses — don't cache 4xx/5xx so the client can retry with the same key after fixing the request
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient
          .set(
            redisKey,
            JSON.stringify({
              statusCode: res.statusCode,
              data: typeof data === "string" ? JSON.parse(data) : data,
              fingerprint,
            }),
            "EX",
            IDEMPOTENCY_TTL_SECONDS,
          )
          .catch(() => {});
      }
      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    logger.error("Idempotency check failed — proceeding without idempotency", {
      error: error.message,
      requestId: res.locals.requestId,
    });
    next();
  }
};

export default checkIdempotency;
