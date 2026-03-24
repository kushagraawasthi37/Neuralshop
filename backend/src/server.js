// Load environment variables FIRST, before importing anything else
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Use dynamic imports to ensure environment variables are loaded before module initialization
const app = (await import("./app.js")).default;
const config = (await import("./config/environment.config.js")).default;
const { logger, logStartup, logDatabase } = await import("./utils/logger.js");

const PORT = config.app.port;

app.listen(PORT, () => {
  logStartup(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: config.app.env,
  });
  logDatabase(
    `MongoDB ${config.database.mongoUrl ? "connected" : "not configured"}`,
  );
});
