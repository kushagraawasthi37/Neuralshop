import { createKafkaConsumer, kafkaProducer } from "../config/kafka.js";
import { logger } from "../utils/logger.js";

// ─── BaseConsumer ─────────────────────────────────────────────────────────
// All four consumers (order, payment, inventory, mail) extend this class.
// It provides:
//   • Exponential backoff retry (up to MAX_RETRIES attempts)
//   • Dead Letter Queue publishing after exhausted retries
//   • Structured logging with correlation IDs from the Kafka message headers
//
// WHY DLQ: A bad message can crash a consumer in an infinite retry loop.
// After MAX_RETRIES we publish to {topic}.dlq and move on. An operator can
// inspect the DLQ and replay/fix messages without blocking the main topic.

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export class BaseConsumer {
  constructor(groupId, topics) {
    this.groupId = groupId;
    this.topics = Array.isArray(topics) ? topics : [topics];
    this.consumer = createKafkaConsumer(groupId);
  }

  // Subclasses override this — return true on success, throw on failure
  async processMessage(_topic, _partition, _message, _event) {
    throw new Error("processMessage() must be implemented by subclass");
  }

  async start() {
    await this.consumer.connect();

    for (const topic of this.topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const requestId =
          message.headers?.requestId?.toString() ?? "no-correlation-id";
        const offset = message.offset;

        let event;
        try {
          event = JSON.parse(message.value.toString());
        } catch (parseErr) {
          logger.error("Kafka: unparseable message → DLQ", {
            topic, partition, offset, requestId, error: parseErr.message,
          });
          await this._sendToDlq(topic, message, parseErr, requestId);
          return;
        }

        let attempt = 0;
        while (attempt < MAX_RETRIES) {
          try {
            await this.processMessage(topic, partition, message, event);
            logger.debug("Kafka: message processed", {
              topic, partition, offset, attempt: attempt + 1, requestId,
              eventType: event.eventType,
            });
            return; // success
          } catch (err) {
            attempt++;
            const delay = BASE_DELAY_MS * 2 ** (attempt - 1); // 500, 1000, 2000 ms
            logger.warn(`Kafka: processing failed, attempt ${attempt}/${MAX_RETRIES}`, {
              topic, offset, requestId, eventType: event.eventType,
              error: err.message, retryDelayMs: delay,
            });

            if (attempt < MAX_RETRIES) {
              await new Promise((r) => setTimeout(r, delay));
            }
          }
        }

        // All retries exhausted — send to DLQ
        await this._sendToDlq(topic, message, new Error("Max retries exhausted"), requestId, event);
      },
    });

    logger.info(`Kafka consumer started: topics=[${this.topics}] group=${this.groupId}`);
    return this.consumer; // returned to server.js for graceful disconnect
  }

  async disconnect() {
    await this.consumer.disconnect();
    logger.info(`Kafka consumer disconnected: group=${this.groupId}`);
  }

  async _sendToDlq(originalTopic, message, error, requestId, parsedEvent = null) {
    const dlqTopic = `${originalTopic}.dlq`;

    const dlqPayload = {
      originalTopic,
      originalOffset: message.offset,
      originalPartition: message.partition,
      requestId,
      error: error.message,
      timestamp: new Date().toISOString(),
      originalValue: message.value.toString(),
      ...(parsedEvent && { event: parsedEvent }),
    };

    try {
      await kafkaProducer.send({
        topic: dlqTopic,
        messages: [
          {
            key: message.key,
            value: JSON.stringify(dlqPayload),
            headers: { "x-dlq-source": originalTopic, "x-request-id": requestId },
          },
        ],
      });

      logger.error("Kafka: message sent to DLQ", {
        dlqTopic, originalTopic, requestId, error: error.message,
        eventType: parsedEvent?.eventType ?? "unknown",
        category: "kafka-dlq",
      });
    } catch (dlqErr) {
      // DLQ publish failed — at minimum alert loudly so ops team sees it
      logger.error("Kafka: DLQ publish FAILED — message lost!", {
        dlqTopic, originalTopic, requestId,
        dlqError: dlqErr.message,
        originalError: error.message,
        payload: dlqPayload,
        category: "kafka-dlq",
      });
    }
  }
}

export default BaseConsumer;
