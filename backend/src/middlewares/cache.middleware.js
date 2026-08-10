import { getCache, setCache, deleteByPattern } from "../utils/cache.js";
import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

// ─── Why this exists ──────────────────────────────────────────────────────
// Hot paths like "browse all products" hit MongoDB + Elasticsearch on every
// request. Even a 5-minute TTL cuts DB load by ~99% at typical e-commerce
// read/write ratios (95% reads). The stampede guard prevents the "thundering
// herd" problem when the cache expires under load.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Core cache middleware factory ───────────────────────────────────────
export const cacheMiddleware = (keyGenerator, ttl) => {
  return async (req, res, next) => {
    let key;
    try {
      key = keyGenerator(req);
    } catch {
      return next();
    }

    try {
      const cached = await getCache(key);
      if (cached !== null) {
        logger.debug("Cache hit", {
          key,
          requestId: res.locals.requestId,
          category: "cache",
        });
        return res.status(200).json(cached);
      }

      // Stampede guard: one request wins the lock and fills the cache;
      // others poll up to 3 times then fall through to the controller.
      const lockKey = `lock:${key}`;
      
      // "NX" → Set the key only if it doesn't already exist.
      const lockAcquired = await redisClient
        .set(lockKey, "1", "EX", 5, "NX")
        .catch(() => null);

      if (!lockAcquired) {
        for (let i = 0; i < 3; i++) {
          await sleep(100);
          const retry = await getCache(key);
          if (retry !== null) {
            logger.debug("Cache hit (after lock wait)", {
              key,
              category: "cache",
            });
            return res.status(200).json(retry);
          }
        }
        return next();
      }

      logger.debug("Cache miss", {
        key,
        requestId: res.locals.requestId,
        category: "cache",
      });

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        res.json = originalJson;
        redisClient.del(lockKey).catch(() => {});
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const effectiveTtl = typeof ttl === "function" ? ttl(req) : ttl;
          setCache(key, body, effectiveTtl).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch {
      next();
    }
  };
};

// ─── Pre-built route caches ───────────────────────────────────────────────

// GET /api/product/browse/all → key: product:browse:{page}:{limit}:{category}
export const browseProductsCache = cacheMiddleware(
  (req) => {
    const { page = 1, limit = 20, category = "all", skip = 0 } = req.query;
    return `product:browse:${page}:${limit}:${skip}:${category}`;
  },
  5 * 60, // 5 minutes
);

// GET /api/product/:id → key: product:detail:{id}
export const productDetailCache = cacheMiddleware(
  (req) => `product:detail:${req.params.id}`,
  10 * 60, // 10 minutes
);

// GET /api/recommendations/* → key: rec:{userId}:{path}
export const recommendationsCache = cacheMiddleware(
  (req) => `rec:${req.userId ?? "anon"}:${req.path}`,
  15 * 60, // 15 minutes
);

// GET /api/analytics/* → key: analytics:{adminId}:{path}:{query}
// Short TTL because analytics data changes with every order
export const analyticsCache = cacheMiddleware(
  (req) =>
    `analytics:${req.adminId ?? "x"}:${req.path}:${JSON.stringify(req.query)}`,
  2 * 60, // 2 minutes
);

// ─── Cache invalidation helpers ───────────────────────────────────────────
// Always use SCAN-based deleteByPattern, never KEYS — KEYS blocks the Redis event loop and causes latency spikes proportional to keyspace size.

export const invalidateProductCache = async () => {
  await Promise.all([
    deleteByPattern("product:browse:*"),
    deleteByPattern("product:detail:*"),
    deleteByPattern("rec:*"),
  ]);
  logger.info("Product cache invalidated", { category: "cache" });
};

export const invalidateAnalyticsCache = async () => {
  await deleteByPattern("analytics:*");
  logger.info("Analytics cache invalidated", { category: "cache" });
};

export const invalidateRecommendationsCache = async (userId) => {
  const pattern = userId ? `rec:${userId}:*` : "rec:*";
  await deleteByPattern(pattern);
};
