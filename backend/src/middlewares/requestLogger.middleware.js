import { randomUUID } from "crypto";
import { logger } from "../utils/logger.js";

// ─── Request Logger Middleware ─────────────────────────────────────────────
// Attaches a UUID correlation ID to every request so all log lines for a
// single request (across Express, Kafka producers, async tasks) share one ID.
// The ID is in res.locals.requestId and the X-Request-Id response header.
//
// WHY correlation IDs: in a Kafka-driven flow an order event touches 4 consumers.
// Without a shared requestId you cannot grep logs to reconstruct the trace.

const requestLogger = (req, res, next) => {
  const requestId =
    req.headers["x-request-id"] ||
    req.headers["x-correlation-id"] ||
    randomUUID();

  // Expose for controllers and Kafka producers via res.locals
  res.locals.requestId = requestId;
  req.requestId = requestId;

  // Echo back so the frontend can correlate its own logs
  res.setHeader("X-Request-Id", requestId);

  const startAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "http";

    logger[level](`${req.method} ${req.originalUrl}`, {
      requestId,
      statusCode: res.statusCode,
      durationMs: durationMs.toFixed(2),
      ip: req.ip,
      userAgent: req.get("user-agent")?.slice(0, 80),
      userId: req.userId ?? req.adminId ?? undefined,
      category: "http",
    });
  });

  next();
};

export default requestLogger;
