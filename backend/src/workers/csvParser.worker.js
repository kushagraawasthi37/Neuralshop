// ─── CSV Parser Worker Thread ─────────────────────────────────────────────
// WHY worker threads for CSV: parsing a large CSV payload in a tight JS loop
// can monopolize the main thread for hundreds of milliseconds. The worker
// keeps that parsing off the event loop while the main thread only validates
// the rows and performs the database updates.

import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

export const parseCsvContentInWorker = (csvContent) => {
  const text =
    typeof csvContent === "string"
      ? csvContent
      : Buffer.isBuffer(csvContent)
        ? csvContent.toString("utf-8")
        : String(csvContent ?? "");

  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  return lines.map((line) =>
    line.split(",").map((value) => value.trim().replace(/^"|"$/g, "")),
  );
};

if (!isMainThread) {
  const { csvBuffer, csvContent } = workerData;

  try {
    const rows = parseCsvContentInWorker(csvBuffer ?? csvContent);
    parentPort.postMessage({ success: true, rows });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }

  process.exit(0);
}

export const parseCsvInWorker = (csvBuffer) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: {
        csvBuffer:
          csvBuffer instanceof Buffer ? csvBuffer : Buffer.from(csvBuffer),
      },
    });

    worker.once("message", ({ success, rows, error }) => {
      if (success) resolve(rows);
      else reject(new Error(error));
    });

    worker.once("error", reject);

    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`CSV worker exited with code ${code}`));
      }
    });
  });
