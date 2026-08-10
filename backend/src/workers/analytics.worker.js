// ─── Analytics Worker Thread ──────────────────────────────────────────────
// WHY worker threads for analytics: post-query JavaScript aggregation and
// bucketing can be CPU-heavy when the result sets are large. The database
// handles the I/O and grouping efficiently; the worker only performs the
// in-process shaping that would otherwise block the main event loop.

import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

export const processAnalyticsPayload = (taskName, payload = {}) => {
  switch (taskName) {
    case "dailySales": {
      const { dailySales = [] } = payload;
      const dailyMap = new Map();

      for (const entry of dailySales) {
        const dateKey = new Date(entry.createdAt).toISOString().split("T")[0];
        const current = dailyMap.get(dateKey) ?? {
          date: dateKey,
          revenue: 0,
          orders: 0,
        };

        current.revenue += Number(entry._sum?.price || 0);
        const count =
          typeof entry._count === "number"
            ? entry._count
            : entry._count?._all || 0;
        current.orders += Number(count || 0);
        dailyMap.set(dateKey, current);
      }

      return Array.from(dailyMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
    }

    case "customerAnalytics": {
      const { allCustomers = [], customerValue = [] } = payload;
      const repeatCustomers = allCustomers.filter((c) => c._count >= 2).length;

      const avgCustomerValue =
        customerValue.length > 0
          ? customerValue.reduce(
              (sum, customer) => sum + (customer._avg?.totalAmount || 0),
              0,
            ) / customerValue.length
          : 0;

      return { repeatCustomers, avgCustomerValue };
    }

    default:
      throw new Error(`Unknown analytics task: ${taskName}`);
  }
};

if (!isMainThread) {
  const { taskName, payload } = workerData;

  try {
    const result = processAnalyticsPayload(taskName, payload);
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }

  process.exit(0);
}

export const runAnalyticsTask = (taskName, payload = {}) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { taskName, payload },
    });

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error(`Analytics worker timed out: ${taskName}`));
    }, 30_000);

    worker.once("message", ({ success, result, error }) => {
      clearTimeout(timeout);
      if (success) resolve(result);
      else reject(new Error(error));
    });

    worker.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    worker.once("exit", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Analytics worker exited with code ${code}`));
      }
    });
  });

export const runAnalyticsQuery = (queryName, params = {}) =>
  runAnalyticsTask(queryName, params);
