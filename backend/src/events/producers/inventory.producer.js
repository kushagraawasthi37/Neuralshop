// Inventory Producer - Produces inventory events
import { kafkaProducer } from "../../config/kafka.js";
import { inventoryEvents } from "../event-types.js";

export const produceInventoryEvent = async (eventType, inventoryData) => {
  try {
    await kafkaProducer.send({
      topic: "inventory",
      messages: [
        {
          key: inventoryData.productId,
          value: JSON.stringify({
            eventType,
            data: inventoryData,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Inventory event produced: ${eventType}`);
  } catch (error) {
    console.error("Error producing inventory event:", error);
  }
};
