// Mail Producer - Produces mail events
import { kafkaProducer } from "../../config/kafka.js";
import { mailEvents } from "../event-types.js";

export const produceMailEvent = async (eventType, mailData) => {
  try {
    await kafkaProducer.send({
      topic: "emails",
      messages: [
        {
          key: mailData.email,
          value: JSON.stringify({
            eventType,
            data: mailData,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`Mail event produced: ${eventType}`);
  } catch (error) {
    console.error("Error producing mail event:", error);
    console.warn("Kafka not available - email sending disabled");
  }
};
