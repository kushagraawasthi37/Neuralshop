import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// 🔍 DEBUG (remove later)
// console.log("✅ ENV CHECK:", {
//   MONGO_URL: process.env.MONGO_URL,
//   REDIS_URL: process.env.REDIS_URL,
// });
