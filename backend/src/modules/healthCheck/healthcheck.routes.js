import express from "express";
import mongoose from "mongoose";
import redisClient from "../../config/redis.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {},
  };

  try {
    // 🟢 MongoDB check
    health.services.mongo =
      mongoose.connection.readyState === 1 ? "UP" : "DOWN";

    // 🔴 Redis check
    try {
      await redisClient.ping();
      health.services.redis = "UP";
    } catch (err) {
      health.services.redis = "DOWN";
      health.status = "DEGRADED";
    }

    // 🟡 Kafka check (optional lightweight)
    health.services.kafka = "UNKNOWN"; // or track via your producer state

    // Final status logic
    if (health.services.mongo === "DOWN" || health.services.redis === "DOWN") {
      health.status = "DEGRADED";
    }

    return res.status(200).json(health);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
});

export default router;
