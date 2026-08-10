import mongoose from "mongoose";
import { logger, logDatabase, logError } from "../utils/logger.js";
import config from "./environment.config.js";

const connectDB = async () => {
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,
    heartbeatFrequencyMS: 10_000,
    readPreference: "primaryPreferred",
  };

  try {
    logger.info(`Database URL ${config.database.mongoUrl}`);
    await mongoose.connect(config.database.mongoUrl, options);
    logDatabase("Connected successfully", {
      host:
        config.database.mongoUrl?.split("@")[1]?.split("/")[0] || "localhost",
    });
  } catch (error) {
    logError("Failed to connect to MongoDB", error, {
      url: config.database.mongoUrl ? "provided" : "missing",
    });
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected — attempting reconnect", {
      category: "database",
    });
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected", { category: "database" });
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB error", {
      error: error.message,
      category: "database",
    });
  });
};

export default connectDB;
