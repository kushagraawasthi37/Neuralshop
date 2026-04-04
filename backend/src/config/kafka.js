// config/kafka.js
import { Kafka } from "kafkajs";
import config from "./environment.config.js";

class KafkaSingleton {
  constructor() {
    if (!KafkaSingleton.instance) {
      this.kafka = new Kafka({
        clientId: config.kafka.clientId,
        brokers: config.kafka.brokers,
      });

      this._producer = this.kafka.producer();

      this.producerConnected = false;

      KafkaSingleton.instance = this;
    }

    return KafkaSingleton.instance;
  }

  async connectProducer() {
    if (!this.producerConnected) {
      await this._producer.connect();
      this.producerConnected = true;
      // console.log("✅ Kafka Producer Connected");
    }
  }

  get producer() {
    return this._producer;
  }

  createConsumer(groupId = config.kafka.groupId) {
    return this.kafka.consumer({ groupId });
  }
}

const kafkaInstance = new KafkaSingleton();

// 🔥 WRAPPER (IMPORTANT for backward compatibility)
export const kafkaProducer = {
  connect: async () => kafkaInstance.connectProducer(),
  send: async (payload) => {
    await kafkaInstance.connectProducer(); // auto-connect safety
    return kafkaInstance.producer.send(payload);
  },
};

export const createKafkaConsumer = (groupId) =>
  kafkaInstance.createConsumer(groupId);

export default kafkaInstance;
