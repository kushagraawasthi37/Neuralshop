import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
const { PrismaClient } = pkg;

dotenv.config();

// Create a connection pool for PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

let prisma;

// 🔐 Singleton pattern: Prevent multiple Prisma instances
if (process.env.NODE_ENV === "production") {
  // In production, create new instance
  prisma = new PrismaClient({
    adapter,
    log: ["error", "warn"], // Only log errors and warnings
  });
} else {
  // In development, reuse global instance to prevent hot reload issues
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
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
export { prisma };
