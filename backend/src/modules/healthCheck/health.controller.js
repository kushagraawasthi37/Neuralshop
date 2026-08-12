import mongoose from "mongoose";
import redisClient from "../config/redis.js";
import { kafkaProducer } from "../config/kafka.js";
import { logger } from "../utils/logger.js";

// ─── Production Health Check ──────────────────────────────────────────────
// Returns 200 only if all critical services are reachable.
// Returns 503 if any critical service is down (load balancer removes the node).
// Returns 200 with status=DEGRADED if non-critical services (ES) are down.

const checkWithTimeout = async (label, checkFn, timeoutMs = 3000) => {
  const start = Date.now();
  try {
    await Promise.race([
      checkFn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]);
    return { status: "UP", responseMs: Date.now() - start };
  } catch (err) {
    return { status: "DOWN", responseMs: Date.now() - start, error: err.message };
  }
};

export const healthCheck = async (req, res) => {
  const [mongodb, redis, postgres, kafka, elasticsearch] = await Promise.all([
    // MongoDB
    checkWithTimeout("mongodb", async () => {
      if (mongoose.connection.readyState !== 1) throw new Error("not connected");
      await mongoose.connection.db.admin().ping();
    }),

    // Redis
    checkWithTimeout("redis", () => redisClient.ping()),

    // PostgreSQL — use Prisma's raw query
    checkWithTimeout("postgres", async () => {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
    }, 5000),

    // Kafka — check if producer is connected
    checkWithTimeout("kafka", async () => {
      // kafkaProducer.send throws if not connected; a lightweight approach is
      // tracking the connection state on the singleton
      const kInstance = (await import("../config/kafka.js")).default;
      if (!kInstance.producerConnected) throw new Error("producer not connected");
    }),

    // Elasticsearch
    checkWithTimeout("elasticsearch", async () => {
      const esClient = (await import("../config/elasticsearch.js")).default;
      await esClient.ping();
    }),
  ]);

  const critical = { mongodb, redis, postgres };
  const nonCritical = { kafka, elasticsearch };

  const anyDown = Object.values(critical).some((s) => s.status === "DOWN");
  const anyDegraded = Object.values(nonCritical).some((s) => s.status === "DOWN");

  const overallStatus = anyDown ? "DOWN" : anyDegraded ? "DEGRADED" : "UP";
  const httpStatus = anyDown ? 503 : 200;

  const memUsage = process.memoryUsage();

  const payload = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: { ...critical, ...nonCritical },
    memory: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memUsage.rss / 1024 / 1024),
    },
  };

  if (anyDown) {
    logger.warn("Health check FAILED", { payload });
  }

  return res.status(httpStatus).json(payload);
};
zz