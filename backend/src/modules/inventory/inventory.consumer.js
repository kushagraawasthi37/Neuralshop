<<<<<<< HEAD
// // Inventory Consumer - Consumes inventory events from Kafka
// // TODO: Implement inventory consumer
// // - Listen to stock update events
// // - Update product inventory

// import { kafkaConsumer } from "../../config/kafka.js";

// export const startInventoryConsumer = async () => {
//   try {
//     await kafkaConsumer.subscribe({ topic: "inventory" });

//     await kafkaConsumer.run({
//       eachMessage: async ({ topic, partition, message }) => {
//         const event = JSON.parse(message.value.toString());
//         console.log("Inventory event consumed:", event);
//         // TODO: Handle inventory events
//       },
//     });
//   } catch (error) {
//     console.error("Error starting inventory consumer:", error);
//   }
// };
=======
// Inventory Consumer - Consumes inventory events from Kafka
// TODO: Implement inventory consumer
// - Listen to stock update events
// - Update product inventory

import { kafkaConsumer } from "../../config/kafka.js";

export const startInventoryConsumer = async () => {
  try {
    await kafkaConsumer.subscribe({ topic: "inventory" });

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Inventory event consumed:", event);
        // TODO: Handle inventory events
      },
    });
  } catch (error) {
    console.error("Error starting inventory consumer:", error);
  }
};
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
