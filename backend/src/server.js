// ── Load env FIRST — no other import may read process.env before this ────
import "./config/loadenv.js";

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

import app from "./app.js";
import config from "./config/environment.config.js";
import { logger, logStartup, logDatabase } from "./utils/logger.js";
import { startKeepAlive } from "./utils/keep-alive.js";

import redisClient from "./config/redis.js";
import { kafkaProducer } from "./config/kafka.js";
import { startMailConsumer } from "./events/consumers/mail.consumer.js";
import { startOrderConsumer } from "./events/consumers/order.consumer.js";
import { startPaymentConsumer } from "./events/consumers/payment.consumer.js";
import { startInventoryConsumer } from "./events/consumers/inventory.consumer.js";
import createElasticsearchClient from "./config/elasticsearch.js";
import mongoose from "mongoose";
import prisma from "./prisma/client.js";
import { startCleanupJob } from "./jobs/cleanup.job.js";

const PORT = config.app.port;

// Track active consumers so we can disconnect them during shutdown
const activeConsumers = [];

// ── Start server ──────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  logStartup(`Server running on port ${PORT}`, {
    port: PORT,
    environment: config.app.env,
  });

  //Prevent render sleep
  startKeepAlive();

  logDatabase(
    `MongoDB ${config.database.mongoUrl ? "configured" : "not configured"}`,
  );

  try {
    await redisClient.ping();
    logStartup("Redis connected");
  } catch (err) {
    logStartup("Redis unavailable — caching and rate limiting degraded", {
      error: err.message,
    });
  }

  try {
    await createElasticsearchClient();
    logStartup("Elasticsearch connected");
  } catch (err) {
    logStartup("Elasticsearch unavailable — search falls back to MongoDB", {
      error: err.message,
    });
  }

  try {
    await kafkaProducer.connect();
    logStartup("Kafka producer connected");
  } catch (err) {
    logStartup("Kafka producer unavailable — event-driven features disabled", {
      error: err.message,
    });
  }

  try {
    await prisma.$connect();
    logStartup("Prisma connected");
  } catch (err) {
    logStartup("Prisma unavailable — database-backed features degraded", {
      error: err.message,
    });
  }

  try {
    const mailConsumer = await startMailConsumer();
    const orderConsumer = await startOrderConsumer();
    const paymentConsumer = await startPaymentConsumer();
    const inventoryConsumer = await startInventoryConsumer();

    // Consumers may return their instances for graceful disconnect
    [mailConsumer, orderConsumer, paymentConsumer, inventoryConsumer]
      .filter(Boolean)
      .forEach((c) => activeConsumers.push(c));

    logStartup("Kafka consumers started");
  } catch (err) {
    logStartup(
      "Kafka consumers failed to start — event processing unavailable",
      { error: err.message },
    );
  }

  // Start periodic cleanup jobs (idempotency keys, etc.)
  startCleanupJob();
});

// ── Graceful shutdown ─────────────────────────────────────────────────────
// WHY: Kubernetes/Docker send SIGTERM before killing the process.
// If we exit immediately, in-flight HTTP requests and Kafka messages are lost.
// The 30-second drain window lets them finish cleanly.

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Starting graceful shutdown…`);

  // 1. Stop accepting new connections
  server.close(async () => {
    logger.info("HTTP server closed — no new connections accepted");

    try {
      // 2. Disconnect Kafka consumers first (don't lose in-flight events)
      if (activeConsumers.length) {
        await Promise.allSettled(activeConsumers.map((c) => c.disconnect?.()));
        logger.info("Kafka consumers disconnected");
      }

      // 3. Disconnect Kafka producer
      await kafkaProducer.disconnect?.().catch(() => {});
      logger.info("Kafka producer disconnected");

      // 4. Close Redis
      await redisClient.quit().catch(() => {});
      logger.info("Redis disconnected");

      // 5. Close Prisma
      await prisma.$disconnect().catch(() => {});
      logger.info("Prisma disconnected");

      // 6. Close Mongoose
      await mongoose.connection.close();
      logger.info("MongoDB disconnected");

      logger.info("Graceful shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", { error: err.message });
      process.exit(1);
    }
  });

  // 30-second hard timeout — kill if shutdown hangs (container SLA)
  setTimeout(() => {
    logger.error("Shutdown timed out after 30s — forcing exit");
    process.exit(1);
  }, 30_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ── Uncaught exception / rejection handlers ───────────────────────────────
// These are the "last line of defence" — they catch bugs that slipped through
// asyncHandler. Log, then decide whether to restart.
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception — restarting", {
    error: err.message,
    stack: err.stack,
  });
  // Give the logger time to flush, then exit so PM2/Docker restarts us
  setTimeout(() => process.exit(1), 500);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Don't exit on unhandled rejections — they're often non-fatal in libs
  // PM2 will restart if memory/health checks fail
});
