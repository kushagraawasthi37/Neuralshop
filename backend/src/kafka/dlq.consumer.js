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

    // TODO production: add PagerDuty / Slack webhook call here
    // await alertOpsTeam({ topic, event });
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
