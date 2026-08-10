import { BaseConsumer } from "../../kafka/base.consumer.js";
import { inventoryEvents } from "../event-types.js";
import { logger } from "../../utils/logger.js";
import { invalidateProductCache } from "../../middlewares/cache.middleware.js";

class InventoryConsumer extends BaseConsumer {
  constructor() {
    super("inventory-group", "inventory");
  }

  async processMessage(_topic, _partition, _message, event) {
    const { productId, availableStock } = event.data ?? {};

    switch (event.eventType) {
      case inventoryEvents.STOCK_UPDATED:
        logger.info("Stock updated", { productId, availableStock });
        // Invalidate product cache so the next browse/detail request is fresh
        await invalidateProductCache();
        if (availableStock <= 5) {
          logger.warn("Low stock alert", { productId, availableStock });
        }
        break;

      case inventoryEvents.STOCK_LOW:
        logger.warn("Low stock alert received", { productId, availableStock });
        break;

      default:
        logger.warn("InventoryConsumer: unknown event type", { eventType: event.eventType });
    }
  }
}

export const startInventoryConsumer = async () => {
  const consumer = new InventoryConsumer();
  try {
    return await consumer.start();
  } catch (err) {
    logger.warn("Inventory consumer not started", { error: err.message });
  }
};
