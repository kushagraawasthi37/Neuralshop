// Order Consumer - Consumes order events
import { createKafkaConsumer } from "../../config/kafka.js";
import { orderEvents } from "../event-types.js";

export const startOrderConsumer = async () => {
  const consumer = createKafkaConsumer("order-group");
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "orders" });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Order event consumed:", event);

        // Handle order events
        switch (event.eventType) {
          case orderEvents.ORDER_CREATED:
            // Order created - could trigger notifications, emails, etc.
            console.log("Order created event received:", event.data);
            const { orderId, userId, totalAmount } = event.data;
            // Could send order confirmation email, SMS, etc.
            break;

          case orderEvents.ORDER_SHIPPED:
            // Item shipped - notify customer
            console.log("Order shipped event received:", event.data);
            const shipmentData = event.data;
            // Send shipping notification to customer
            // Update order tracking, send email, SMS, push notification
            break;

          case orderEvents.ORDER_DELIVERED:
            // Item delivered - notify customer
            console.log("Order delivered event received:", event.data);
            const deliveryData = event.data;
            // Send delivery confirmation
            // Request review/feedback from customer
            // Mark as fulfillment complete
            break;

          case orderEvents.ORDER_CANCELLED:
            // Order cancelled
            console.log("Order cancelled event received:", event.data);
            // Refund notification, cancellation confirmation email
            break;

          default:
            console.log("Unknown order event:", event.eventType);
        }
      },
    });
  } catch (error) {
    console.error("Error starting order consumer:", error);
  }
};
