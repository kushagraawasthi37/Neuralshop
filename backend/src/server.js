// ==========================
// 🔥 LOAD ENV FIRST (CRITICAL)
// ==========================
import "./config/loadenv.js";

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

// ==========================
// 📦 IMPORTS (AFTER ENV LOAD)
// ==========================
import app from "./app.js";
import config from "./config/environment.config.js";
import { logStartup, logDatabase } from "./utils/logger.js";
import { startKeepAlive } from "./utils/keep-alive.js";

// Redis
import redisClient from "./config/redis.js";

// Kafka
import { kafkaProducer } from "./config/kafka.js";
import { startMailConsumer } from "./events/consumers/mail.consumer.js";
import { startOrderConsumer } from "./events/consumers/order.consumer.js";
import { startPaymentConsumer } from "./events/consumers/payment.consumer.js";
import { startInventoryConsumer } from "./events/consumers/inventory.consumer.js";

//Elastic Search
import createElasticsearchClient from "./config/elasticsearch.js";

// ==========================
// 🚀 SERVER START
// ==========================
const PORT = config.app.port;

app.listen(PORT, async () => {
  logStartup(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: config.app.env,
  });

  // Keep Render free-tier dyno awake by self-pinging /api/healthCheck
  startKeepAlive();

  logDatabase(
    `MongoDB ${config.database.mongoUrl ? "connected" : "not configured"}`,
  );

  // ==========================
  // 🔴 REDIS
  // ==========================
  try {
    await redisClient.ping(); // no getRedis() needed
    logStartup("Redis connected");
  } catch (error) {
    logStartup("Redis connection failed, caching and rate limiting disabled", {
      error: error.message,
    });
  }

  // ==========================
  // 🔴 Elastic Search
  // ==========================
  try {
    await createElasticsearchClient();
    logStartup("Elastic Search connected");
  } catch (error) {
    logStartup("Elasticsearch connection failed, search fallback to MongoDB", {
      error: error.message,
    });
  }

  // ==========================
  // 🟡 KAFKA PRODUCER
  // ==========================
  try {
    await kafkaProducer.connect();
    logStartup("Kafka producer connected");
  } catch (error) {
    logStartup("Kafka producer connection failed, mail features disabled", {
      error: error.message,
    });
  }

  // ==========================
  // 🟢 KAFKA CONSUMERS
  // ==========================
  try {
    await startMailConsumer();
    await startOrderConsumer();
    await startPaymentConsumer();
    await startInventoryConsumer();

    logStartup("Kafka consumers started");
  } catch (error) {
    logStartup(
      "Kafka consumers failed to start, event-driven features may not work",
      {
        error: error.message,
      },
    );
  }
});
