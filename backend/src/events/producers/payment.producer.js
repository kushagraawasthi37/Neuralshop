// Payment Producer - Produces payment events
import { kafkaProducer } from "../../config/kafka.js";
import { paymentEvents } from "../event-types.js";

export const producePaymentEvent = async (eventType, paymentData) => {
  try {
    await kafkaProducer.send({
      topic: "payments",
      messages: [
        {
          key: paymentData.orderId,
          value: JSON.stringify({
            eventType,
            data: paymentData,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Payment event produced: ${eventType}`);
  } catch (error) {
    console.error("Error producing payment event:", error);
  }
};
