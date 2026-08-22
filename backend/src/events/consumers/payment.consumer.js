import { BaseConsumer } from "../../kafka/base.consumer.js";
import { paymentEvents } from "../event-types.js";
import { logger } from "../../utils/logger.js";

class PaymentConsumer extends BaseConsumer {
  constructor() {
    super("payment-group", "payments");
  }

  async processMessage(_topic, _partition, _message, event) {
    // Payment state is authoritative in the verified webhook transaction.
    // Kafka is intentionally observability-only here to avoid a second state writer.
    const { orderId, userId, amount } = event.data ?? {};

    switch (event.eventType) {
      case paymentEvents.PAYMENT_SUCCESS:
        logger.info("Payment success event received", {
          orderId,
          userId,
          amount,
        });
        break;

      case paymentEvents.PAYMENT_FAILED:
        logger.warn("Payment failed event received", { orderId, userId });
        break;

      case paymentEvents.PAYMENT_INITIATED:
        logger.info("Payment initiated event received", { orderId, userId });
        break;

      default:
        logger.warn("PaymentConsumer: unknown event type", {
          eventType: event.eventType,
        });
    }
  }
}

export const startPaymentConsumer = async () => {
  const consumer = new PaymentConsumer();
  try {
    return await consumer.start();
  } catch (err) {
    logger.warn("Payment consumer not started", { error: err.message });
  }
};
