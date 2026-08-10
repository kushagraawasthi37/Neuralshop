import { logger } from "./logger.js";

// ─── Memory Leak Prevention Patterns ─────────────────────────────────────
//
// LEAK 1: Kafka consumer that never unsubscribes
// FIX: BaseConsumer.disconnect() in graceful shutdown (server.js) calls
//      consumer.disconnect() which calls admin.disconnect() and closes the
//      TCP socket. Always return the consumer from startXConsumer() and
//      push to activeConsumers[] so server.js can disconnect them.
//
// LEAK 2: Redis client accumulating event listeners
// FIX: Use the global._redisClient singleton (config/redis.js). Never create
//      new Redis() per request. Each new Redis() adds listeners to process.
//
// LEAK 3: Mongoose connection not pooled
// FIX: Call mongoose.connect() once at startup with maxPoolSize:10.
//      Never call mongoose.connect() per request.
//
// LEAK 4: setInterval for cleanup jobs that isn't cleared on shutdown
// FIX: node-cron's schedule() returns a handle. Call handle.destroy() in
//      stopCleanupJob() which is called during graceful shutdown.
//
// LEAK 5: Large product arrays held in closure (recommendations)
// FIX: Don't cache the full ES response in a module-level variable.
//      Use Redis with TTL instead. Closures holding large arrays prevent GC.
//
// DETECTION: Run the app with --inspect flag:
//   node --inspect src/server.js
//   Open chrome://inspect → Memory → Take Heap Snapshot
//   Compare two snapshots to find objects growing over time.
//
// CLINIC.JS: For automated profiling without stopping the process:
//   npx clinic doctor -- node src/server.js
//   npx clinic heapProfiler -- node src/server.js
//   Open the generated HTML report.

const HEAP_WARN_THRESHOLD_MB = 400;
const HEAP_CRITICAL_THRESHOLD_MB = 480;

export const logMemoryUsage = () => {
  const { heapUsed, heapTotal, rss, external } = process.memoryUsage();
  const toMB = (b) => Math.round(b / 1024 / 1024);

  const heapMB = toMB(heapUsed);

  const level =
    heapMB > HEAP_CRITICAL_THRESHOLD_MB
      ? "error"
      : heapMB > HEAP_WARN_THRESHOLD_MB
        ? "warn"
        : "debug";

  logger[level]("Process memory usage", {
    heapUsedMB: heapMB,
    heapTotalMB: toMB(heapTotal),
    rssMB: toMB(rss),
    externalMB: toMB(external),
    category: "memory",
  });

  return { heapUsedMB: heapMB, heapTotalMB: toMB(heapTotal), rssMB: toMB(rss) };
};

// Call this from server.js if you want periodic memory logging
// e.g. setInterval(monitorMemory, 60_000) — but save the handle for clearInterval on shutdown
export const startMemoryMonitor = (intervalMs = 60_000) => {
  const handle = setInterval(() => logMemoryUsage(), intervalMs);
  handle.unref(); // Don't prevent process exit
  return handle;
};
