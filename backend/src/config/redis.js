import Redis from "ioredis";
import { logger } from "../utils/logger.js";

let redisClient;

if (!global._redisClient) {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASS,

    retryStrategy: (times) => Math.min(50 * 2 ** times, 2000),
    maxRetriesPerRequest: 3,
  });

  redisClient.on("connect", () => logger.info("✅ Redis Connected"));
  redisClient.on("ready", () => logger.info("🚀 Redis Ready"));
  redisClient.on("error", (err) =>
    logger.error("❌ Redis Error:", err.message),
  );

  global._redisClient = redisClient;
} else {
  redisClient = global._redisClient;
}

export default redisClient;
