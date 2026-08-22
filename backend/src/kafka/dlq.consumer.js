import { BaseConsumer } from "./base.consumer.js";
import { logger } from "../utils/logger.js";

// ─── DLQ Monitor Consumer ─────────────────────────────────────────────────
// Subscribes to all *.dlq topics and logs/alerts when messages arrive.
// Extend this to send PagerDuty / Slack alerts in production.

const DLQ_TOPICS = [
  "orders.dlq",
  "payments.dlq",
  "emails.dlq",
  "inventory.dlq",
];

const alertOpsTeam = async ({ topic, event }) => {
  const webhookUrl = process.env.DLQ_ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, event }),
  });
  if (!response.ok)
    throw new Error(`DLQ alert webhook returned ${response.status}`);
};

class DlqConsumer extends BaseConsumer {
  constructor() {
    super("dlq-monitor-group", DLQ_TOPICS);
  }

  async processMessage(topic, _partition, _message, event) {
    // DLQ events are already logged by BaseConsumer — here we add alerting
    logger.error("DLQ message received — manual intervention required", {
      topic,
      originalTopic: event.originalTopic,
      originalOffset: event.originalOffset,
      requestId: event.requestId,
      error: event.error,
      eventType: event.event?.eventType ?? "unknown",
      timestamp: event.timestamp,
      category: "kafka-dlq",
    });

    try {
      await alertOpsTeam({ topic, event });
    } catch (error) {
      logger.error("DLQ alert delivery failed", {
        topic,
        error: error.message,
        category: "kafka-dlq",
      });
    }
  }
}

export const startDlqConsumer = async () => {
  const consumer = new DlqConsumer();
  try {
    return await consumer.start();
  } catch (err) {
    logger.warn("DLQ consumer failed to start", { error: err.message });
  }
};

export default DlqConsumer;
