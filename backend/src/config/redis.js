import Redis from "ioredis";
import { logger } from "../utils/logger.js";
import config from "./environment.config.js";

let redisClient;

if (!global._redisClient) {
  redisClient = new Redis(config.redis.url, {
    retryStrategy: (times) => Math.min(50 * 2 ** times, 2000),
    maxRetriesPerRequest: 3,
  });

  redisClient.on("connect", () => {
    logger.info("✅ Redis Connected");
  });

  redisClient.on("ready", () => {
    logger.info("🚀 Redis Ready");
  });

  redisClient.on("error", (err) => {
    logger.error(`❌ Redis Error: ${err.message}`);
  });

  global._redisClient = redisClient;
} else {
  redisClient = global._redisClient;
}

export default redisClient;
