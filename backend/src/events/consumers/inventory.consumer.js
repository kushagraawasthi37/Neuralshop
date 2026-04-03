<<<<<<< HEAD
// // Inventory Consumer
// import { kafkaConsumer } from "../../config/kafka.js";

// export const startInventoryConsumer = async () => {
//   try {
//     await kafkaConsumer.connect();
//     await kafkaConsumer.subscribe({ topic: "inventory" });

//     await kafkaConsumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         const event = JSON.parse(message.value.toString());
//         console.log("Inventory event consumed:", event);

//         // Handle inventory events
//         switch (event.eventType) {
//           case "inventory.stock_updated":
//             // Update product stock
//             break;
//           case "inventory.stock_low":
//             // Alert low stock
//             break;
//           default:
//             console.log("Unknown inventory event");
//         }
//       },
//     });
//   } catch (error) {
//     console.error("Error starting inventory consumer:", error);
//     console.warn("Inventory consumer not started - Kafka may not be available");
//   }
// };
=======
// Inventory Consumer
import { kafkaConsumer } from "../../config/kafka.js";

export const startInventoryConsumer = async () => {
  try {
    await kafkaConsumer.subscribe({ topic: "inventory" });

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Inventory event consumed:", event);

        // Handle inventory events
        switch (event.eventType) {
          case "inventory.stock_updated":
            // Update product stock
            break;
          case "inventory.stock_low":
            // Alert low stock
            break;
          default:
            console.log("Unknown inventory event");
        }
      },
    });
  } catch (error) {
    console.error("Error starting inventory consumer:", error);
  }
};
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
