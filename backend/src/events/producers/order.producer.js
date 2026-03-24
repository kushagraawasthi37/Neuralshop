// Order Producer - Produces order events
import { kafkaProducer } from "../../config/kafka.js";
import { orderEvents } from "../event-types.js";

export const produceOrderEvent = async (eventType, orderData) => {
  try {
    await kafkaProducer.send({
      topic: "orders",
      messages: [
        {
          key: orderData.orderId,
          value: JSON.stringify({
            eventType,
            data: orderData,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Order event produced: ${eventType}`);
  } catch (error) {
    console.error("Error producing order event:", error);
  }
};
