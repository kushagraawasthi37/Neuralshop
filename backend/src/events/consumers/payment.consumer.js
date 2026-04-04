// Payment Consumer - Consumes payment events
import { createKafkaConsumer } from "../../config/kafka.js";
import { paymentEvents } from "../event-types.js";

export const startPaymentConsumer = async () => {
  const consumer = createKafkaConsumer("payment-group");
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "payments" });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Payment event consumed:", event);

        // Handle payment events
        switch (event.eventType) {
          case paymentEvents.PAYMENT_SUCCESS:
            // Payment success is already handled by webhook
            console.log("Payment success event received:", event.data);
            break;

          case paymentEvents.PAYMENT_FAILED:
            // Handle payment failure (could trigger notifications, etc.)
            console.log("Payment failed event received:", event.data);
            break;

          case paymentEvents.PAYMENT_INITIATED:
            // Payment initiated (could trigger notifications)
            console.log("Payment initiated event received:", event.data);
            break;

          default:
            console.log("Unknown payment event:", event.eventType);
        }
      },
    });
  } catch (error) {
    console.error("Error starting payment consumer:", error);
  }
};
