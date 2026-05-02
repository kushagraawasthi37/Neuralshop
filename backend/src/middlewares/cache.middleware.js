import { getCache, setCache } from "../utils/cache.js";
import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        logger.info("Cache hit", { key, category: "cache" });
        return res.status(200).json(cached);
      }

      // Stampede protection: acquire a short-lived lock before DB execution
      const lockKey = `lock:${key}`;
      const lockAcquired = await redisClient
        .set(lockKey, "1", "EX", 5, "NX")
        .catch(() => null);

      if (!lockAcquired) {
        // Another request is filling this key — retry cache up to 3 times
        for (let i = 0; i < 3; i++) {
          await sleep(100);
          const retryData = await getCache(key);
          if (retryData !== null) {
            logger.info("Cache hit (after lock wait)", { key, category: "cache" });
            return res.status(200).json(retryData);
          }
        }
        // Still a miss after retries — proceed to controller without caching
        return next();
      }

      logger.debug("Cache miss", { key, category: "cache" });

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
