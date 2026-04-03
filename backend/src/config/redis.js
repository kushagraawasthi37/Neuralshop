<<<<<<< HEAD
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
=======
import redis from "redis";
import config from "./environment.config.js";

const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
});

redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567

export default redisClient;
