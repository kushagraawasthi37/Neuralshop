// config/kafka.js

import { Kafka } from "kafkajs";
import config from "./environment.config.js";

class KafkaSingleton {
  constructor() {
    if (!KafkaSingleton.instance) {
      this.kafka = new Kafka({
        clientId: config.kafka.clientId,

        brokers: [config.kafka.broker],

        ssl: true,

        sasl: {
          mechanism: "plain",
          username: config.kafka.username,
          password: config.kafka.password,
        },

        connectionTimeout: 30000,
        authenticationTimeout: 30000,
        requestTimeout: 30000,
      });

      this._producer = this.kafka.producer();

      this.producerConnected = false;

      KafkaSingleton.instance = this;
    }

    return KafkaSingleton.instance;
  }

  async connectProducer() {
    try {
      if (!this.producerConnected) {
        await this._producer.connect();

        this.producerConnected = true;

        console.log("✅ Kafka Producer Connected");
      }
    } catch (error) {
      console.error("❌ Kafka Producer Connection Error:", error.message);
    }
  }

  get producer() {
    return this._producer;
  }

  createConsumer(groupId = config.kafka.groupId) {
    return this.kafka.consumer({
      groupId,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
  }
}

const kafkaInstance = new KafkaSingleton();

// 🔥 Producer Wrapper
export const kafkaProducer = {
  connect: async () => kafkaInstance.connectProducer(),

  send: async (payload) => {
    await kafkaInstance.connectProducer();

    return kafkaInstance.producer.send(payload);
  },
};

// 🔥 Consumer Factory
export const createKafkaConsumer = (groupId) =>
  kafkaInstance.createConsumer(groupId);

export default kafkaInstance;
