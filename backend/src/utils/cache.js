import redisClient from "../config/redis.js";
import crypto from "crypto";
import { logger } from "./logger.js";

const sortKeys = (obj) => {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortKeys(obj[k]);
        return acc;
      }, {});
  }
  return obj;
};

export const stableHash = (obj) =>
  crypto
    .createHash("md5")
    .update(JSON.stringify(sortKeys(obj || {})))
    .digest("hex");

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCache = async (key, data, ttl) => {
  try {
    await redisClient.set(key, JSON.stringify(data), "EX", ttl);
  } catch {
    // silent — cache failure must never break the request
  }
};

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    logger.debug("Cache invalidated", { key, category: "cache" });
  } catch {
    // silent
  }
};

export const deleteByPattern = async (pattern) => {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.debug(`Cache invalidated ${keys.length} key(s) by pattern`, {
          pattern,
          keys,
          category: "cache",
        });
      }
    } while (cursor !== "0");
  } catch {
    // silent
  }
};
