import mongoose from "mongoose";
import { logger, logDatabase, logError } from "../utils/logger.js";
import config from "./environment.config.js";

const connectDB = async () => {
  try {
    logger.info(`Database URL ${config.database.mongoUrl}`);
    await mongoose.connect(config.database.mongoUrl);
    logDatabase("Connected successfully", {
      host:
        config.database.mongoUrl?.split("@")[1]?.split("/")[0] || "localhost",
    });
  } catch (error) {
    logError("Failed to connect to MongoDB", error, {
      url: config.database.mongoUrl ? "provided" : "missing",
    });
  }
};

export default connectDB;
