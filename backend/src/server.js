// ==========================
// 🔥 LOAD ENV FIRST (CRITICAL)
// ==========================
import "./config/loadenv.js";

// ==========================
// 📦 IMPORTS (AFTER ENV LOAD)
// ==========================
import app from "./app.js";
import config from "./config/environment.config.js";
import { logStartup, logDatabase } from "./utils/logger.js";

// Redis
import redisClient from "./config/redis.js";

// Kafka
import { kafkaProducer } from "./config/kafka.js";
import { startMailConsumer } from "./events/consumers/mail.consumer.js";

// ⚠️ KEEP THESE (for future use)
// import { startPaymentConsumer } from "./events/consumers/payment.consumer.js";
// import { startInventoryConsumer } from "./events/consumers/inventory.consumer.js";

// ==========================
// 🚀 SERVER START
// ==========================
const PORT = config.app.port;

app.listen(PORT, async () => {
  logStartup(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: config.app.env,
  });

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
    console.warn("Redis connection failed:", error.message);
    console.warn("Caching / rate limiting disabled.");
  }

  // ==========================
  // 🟡 KAFKA PRODUCER
  // ==========================
  try {
    await kafkaProducer.connect();
    logStartup("Kafka producer connected");
  } catch (error) {
    console.warn("Kafka producer connection failed:", error.message);
    console.warn(
      "Mail features will not work. Start Kafka to enable email sending.",
    );
  }

  // ==========================
  // 🟢 KAFKA CONSUMERS
  // ==========================
  try {
    await startMailConsumer();

    // 🔒 KEEP FOR FUTURE (do not delete)
    // await startPaymentConsumer();
    // await startInventoryConsumer();

    logStartup("Kafka consumers started");
  } catch (error) {
    console.warn("Kafka consumers failed to start:", error.message);
    console.warn("Event-driven features may not work. Start Kafka to enable.");
  }
});
