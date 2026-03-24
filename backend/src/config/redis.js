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

export default redisClient;
