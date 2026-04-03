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
      this._consumer = this.kafka.consumer({
        groupId: config.kafka.groupId,
      });

      this.producerConnected = false;
      this.consumerConnected = false;

      KafkaSingleton.instance = this;
    }

    return KafkaSingleton.instance;
  }

  async connectProducer() {
    if (!this.producerConnected) {
      await this._producer.connect();
      this.producerConnected = true;
      console.log("✅ Kafka Producer Connected");
    }
  }

  async connectConsumer() {
    if (!this.consumerConnected) {
      await this._consumer.connect();
      this.consumerConnected = true;
      console.log("✅ Kafka Consumer Connected");
    }
  }

  get producer() {
    return this._producer;
  }

  get consumer() {
    return this._consumer;
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

export const kafkaConsumer = kafkaInstance.consumer;

export default kafkaInstance;
