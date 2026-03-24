import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

let prisma;

// 🔐 Singleton pattern: Prevent multiple Prisma instances
if (process.env.NODE_ENV === "production") {
  // In production, create new instance
  prisma = new PrismaClient({
    log: ["error", "warn"], // Only log errors and warnings
  });
} else {
  // In development, reuse global instance to prevent hot reload issues
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn"], // Log queries in development
    });
    console.log("✅ Prisma Client initialized");
  }
  prisma = global.prisma;
}

// 🛡️ Handle prisma errors
prisma.$on("error", (e) => {
  console.error("❌ Prisma Error:", e.message);
});

export default prisma;
