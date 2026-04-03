<<<<<<< HEAD
// // Payment Consumer - Consumes payment events
// import { kafkaConsumer } from "../../config/kafka.js";

// export const startPaymentConsumer = async () => {
//   try {
//     await kafkaConsumer.connect();
//     await kafkaConsumer.subscribe({ topic: "payments" });

//     await kafkaConsumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         const event = JSON.parse(message.value.toString());
//         console.log("Payment event consumed:", event);

//         // Handle payment events
//         switch (event.eventType) {
//           case "payment.success":
//             // Update order status
//             break;
//           case "payment.failed":
//             // Handle payment failure
//             break;
//           default:
//             console.log("Unknown payment event");
//         }
//       },
//     });
//   } catch (error) {
//     console.error("Error starting payment consumer:", error);
//     console.warn("Payment consumer not started - Kafka may not be available");
//   }
// };
=======
// Payment Consumer - Consumes payment events
import { kafkaConsumer } from "../../config/kafka.js";

export const startPaymentConsumer = async () => {
  try {
    await kafkaConsumer.subscribe({ topic: "payments" });

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Payment event consumed:", event);

        // Handle payment events
        switch (event.eventType) {
          case "payment.success":
            // Update order status
            break;
          case "payment.failed":
            // Handle payment failure
            break;
          default:
            console.log("Unknown payment event");
        }
      },
    });
  } catch (error) {
    console.error("Error starting payment consumer:", error);
  }
};
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
