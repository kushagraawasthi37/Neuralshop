// Inventory Consumer
import { createKafkaConsumer } from "../../config/kafka.js";
import { inventoryEvents } from "../event-types.js";

export const startInventoryConsumer = async () => {
  const consumer = createKafkaConsumer("inventory-group");
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "inventory" });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Inventory event consumed:", event);

        // Handle inventory events
        switch (event.eventType) {
          case inventoryEvents.STOCK_UPDATED:
            // Handle stock update (could trigger notifications, alerts, etc.)
            console.log("Stock updated event received:", event.data);
            const { productId, availableStock } = event.data;

            // Check if stock is low
            if (availableStock <= 5) {
              console.log(
                `Low stock alert for product ${productId}: ${availableStock} remaining`,
              );
              // Could send notifications, emails, etc.
            }
            break;

          case inventoryEvents.STOCK_LOW:
            // Handle low stock alerts
            console.log("Low stock alert received:", event.data);
            break;

          default:
            console.log("Unknown inventory event:", event.eventType);
        }
      },
    });
  } catch (error) {
    console.error("Error starting inventory consumer:", error);
  }
};
