import { Kafka } from "kafkajs";
import config from "./environment.config.js";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({
  groupId: config.kafka.groupId,
});

export default kafka;
