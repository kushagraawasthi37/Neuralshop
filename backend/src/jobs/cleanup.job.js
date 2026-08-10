import cron from "node-cron";
import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

// ─── Idempotency key cleanup ──────────────────────────────────────────────
// Redis TTLs already expire keys automatically, so this job is a safety net
// for keys that somehow lost their TTL (e.g. SET without EX during a bug).
//
// We use SCAN (not KEYS) to iterate — KEYS blocks the event loop for the
// entire keyspace scan duration. SCAN is O(1) per call with up to COUNT
// results per batch, spreading the work across many event loop ticks.

const IDEMPOTENCY_PREFIX = "idempotency:*";
const STALE_AGE_SECONDS = 48 * 60 * 60; // 48 hours

const cleanupIdempotencyKeys = async () => {
  let cursor = "0";
  let deleted = 0;
  let scanned = 0;

  try {
    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        IDEMPOTENCY_PREFIX,
        "COUNT",
        200,
      );
      cursor = nextCursor;
      scanned += keys.length;

      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        // ttl = -1 means key has no expiry — delete it (shouldn't happen, but safety net)
        // ttl = -2 means key doesn't exist (race condition) — skip
        if (ttl === -1) {
          await redisClient.del(key);
          deleted++;
        }
      }
    } while (cursor !== "0");

    if (deleted > 0 || scanned > 0) {
      logger.info("Idempotency cleanup complete", {
        scanned,
        deleted,
        category: "cleanup",
      });
    }
  } catch (err) {
    logger.error("Idempotency cleanup failed", { error: err.message, category: "cleanup" });
  }
};

// ─── Refresh token cleanup ────────────────────────────────────────────────
// Remove expired refreshTokenHash fields from MongoDB User documents.
// This is cosmetic — expired hashes are rejected by the controller anyway —
// but keeps the DB lean.
let mongooseCleanup = null;

const cleanupExpiredRefreshTokens = async () => {
  try {
    if (!mongooseCleanup) {
      // Lazy import to avoid circular deps at module load time
      const { User } = await import("../modules/user/user.model.js");
      mongooseCleanup = User;
    }
    const result = await mongooseCleanup.updateMany(
      { refreshTokenExpiry: { $lt: new Date() } },
      { $unset: { refreshTokenHash: 1, refreshTokenExpiry: 1 } },
    );
    if (result.modifiedCount > 0) {
      logger.info("Expired refresh tokens cleaned", {
        count: result.modifiedCount,
        category: "cleanup",
      });
    }
  } catch (err) {
    logger.error("Refresh token cleanup failed", { error: err.message, category: "cleanup" });
  }
};

let cleanupJobHandle = null;

export const startCleanupJob = () => {
  // Run at 3 AM every day — low-traffic window
  cleanupJobHandle = cron.schedule("0 3 * * *", async () => {
    logger.info("Cleanup job started", { category: "cleanup" });
    await Promise.allSettled([
      cleanupIdempotencyKeys(),
      cleanupExpiredRefreshTokens(),
    ]);
  });

  logger.info("Cleanup job scheduled (daily at 03:00)", { category: "cleanup" });
  return cleanupJobHandle;
};

export const stopCleanupJob = () => {
  if (cleanupJobHandle) {
    cleanupJobHandle.destroy();
    cleanupJobHandle = null;
    logger.info("Cleanup job stopped", { category: "cleanup" });
  }
};
