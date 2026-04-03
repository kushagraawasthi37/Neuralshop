// Idempotency utilities for preventing duplicate requests using Redis
import redisClient from "../config/redis.js";

const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export const checkIdempotency = async (req, res, next) => {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return next();
  }

  const redisKey = `idempotency:${idempotencyKey}`;

  try {
    // Check if response is already cached
    const cachedResponse = await redisClient.get(redisKey);
    if (cachedResponse) {
      const { statusCode, data } = JSON.parse(cachedResponse);
      return res.status(statusCode).json(data);
    }

    // Express ka original response function store kar liya
    const originalSend = res.send;

    // Ab jab bhi controller res.send() call karega:
    // Ye custom function chalega
    // Ye ek hook/interceptor hai
    res.send = function (data) {
      // Cache the response in Redis
      redisClient.set(
        redisKey,
        JSON.stringify({
          statusCode: res.statusCode,
          data: typeof data === "string" ? JSON.parse(data) : data,
        }),
        "EX",
        IDEMPOTENCY_TTL_SECONDS,
      );

      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    // If Redis fails, continue without idempotency
    console.error("Idempotency check failed:", error);
    next();
  }
};

export default checkIdempotency;
