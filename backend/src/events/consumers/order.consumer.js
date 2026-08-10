import { BaseConsumer } from "../../kafka/base.consumer.js";
import { orderEvents } from "../event-types.js";
import { logger } from "../../utils/logger.js";

class OrderConsumer extends BaseConsumer {
  constructor() {
    super("order-group", "orders");
  }

  async processMessage(_topic, _partition, _message, event) {
    const { orderId, userId, totalAmount } = event.data ?? {};

    switch (event.eventType) {
      case orderEvents.ORDER_CREATED:
        logger.info("Order created event received", { orderId, userId, totalAmount });
        break;

      case orderEvents.ORDER_SHIPPED:
        logger.info("Order shipped event received", { orderId });
        break;

      case orderEvents.ORDER_DELIVERED:
        logger.info("Order delivered event received", { orderId });
        break;

      case orderEvents.ORDER_CANCELLED:
        logger.info("Order cancelled event received", { orderId });
        break;

      default:
        logger.warn("OrderConsumer: unknown event type", { eventType: event.eventType });
    }
  }
}

export const startOrderConsumer = async () => {
  const consumer = new OrderConsumer();
  try {
    return await consumer.start();
  } catch (err) {
    logger.warn("Order consumer not started", { error: err.message });
  }
};
