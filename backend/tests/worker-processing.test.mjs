import assert from "node:assert/strict";
import { processAnalyticsPayload } from "../src/workers/analytics.worker.js";
import { parseCsvContentInWorker } from "../src/workers/csvParser.worker.js";

const dailySales = [
  { createdAt: "2026-08-01T10:00:00.000Z", _sum: { price: 100 }, _count: 2 },
  { createdAt: "2026-08-01T11:00:00.000Z", _sum: { price: 50 }, _count: 1 },
  { createdAt: "2026-08-02T08:00:00.000Z", _sum: { price: 75 }, _count: 3 },
];

const analyticsResult = processAnalyticsPayload("dailySales", { dailySales });
assert.deepEqual(analyticsResult, [
  { date: "2026-08-01", revenue: 150, orders: 3 },
  { date: "2026-08-02", revenue: 75, orders: 3 },
]);

const csvRows = parseCsvContentInWorker(
  "productId,size,totalStock\nP1,M,10\nP2,L,20\n",
);
assert.deepEqual(csvRows, [
  ["productId", "size", "totalStock"],
  ["P1", "M", "10"],
  ["P2", "L", "20"],
]);

console.log("worker-processing tests passed");
