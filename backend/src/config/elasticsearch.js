import { Client } from "@elastic/elasticsearch";
import config from "./environment.config.js";
import { logger } from "../utils/logger.js";

let esClient;

const createElasticsearchClient = async () => {
  if (esClient) return esClient;

  esClient = new Client({
    node: config.elasticsearch.node,
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
  });

  try {
    await esClient.ping();
    logger.info("✅ Elasticsearch connected");
  } catch (err) {
    logger.error("❌ Elasticsearch connection failed", {
      error: err.message,
    });
  }

  return esClient;
};

export default createElasticsearchClient;
