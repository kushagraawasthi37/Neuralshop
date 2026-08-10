import Redis from "ioredis";
import { logger } from "../utils/logger.js";
import config from "./environment.config.js";

// ─── Why singleton with retryStrategy ────────────────────────────────────
// ioredis auto-reconnects, but without backoff it hammers a crashed Redis.
// Math.min(50 * 2^n, 10_000) → 50 ms, 100, 200, … capped at 10 s.
// maxRetriesPerRequest=3 means a single command fails fast instead of
// blocking the event loop for 30+ seconds during a Redis outage.

const createClient = () => {
  const client = new Redis(config.redis.url, {
    retryStrategy: (times) => {
      if (times > 20) {
        logger.error("Redis: too many retries, giving up reconnect");
        return null; // stop retrying — ioredis will emit 'error' events
      }
      return Math.min(50 * 2 ** times, 10_000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // Keep alive so cloud providers don't close idle connections
    keepAlive: 10_000,
    // Don't buffer commands when reconnecting — fail fast so callers can fallback
    enableOfflineQueue: false,
    lazyConnect: false,
  });

  client.on("connect", () => logger.info("Redis: TCP connection established"));
  client.on("ready", () => logger.info("Redis: ready"));
  client.on("reconnecting", (ms) => logger.warn(`Redis: reconnecting in ${ms}ms`));
  client.on("error", (err) => {
    // Log but don't crash — Redis outage degrades to no-cache, not downtime
    logger.error("Redis error", { message: err.message });
  });
  client.on("close", () => logger.warn("Redis: connection closed"));
  client.on("end", () => logger.warn("Redis: connection ended permanently"));

  return client;
};

// ─── Guard against hot-reload re-creating the client in dev ──────────────
// Without this global guard, nodemon restarts would leak Redis TCP connections
// and accumulate event listeners — triggering Node's MaxListenersExceeded warning.
if (!global._redisClient) {
  global._redisClient = createClient();
}

// Memory leak note: ioredis registers several internal listeners (error, close, etc.)
// on the underlying net.Socket. They are cleaned up on disconnect() — always call
// redisClient.quit() during graceful shutdown (done in server.js).

const redisClient = global._redisClient;
export default redisClient;
