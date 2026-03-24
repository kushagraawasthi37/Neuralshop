// NOTE: dotenv.config() is called in server.js before importing this module
import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { setupRoutes } from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import { logger, logRequest } from "./utils/logger.js";
import config from "./config/environment.config.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware with improved formatting
app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    logRequest(req.method, req.path, res.statusCode, {
      ip: req.ip,
      userAgent: req.get("user-agent")?.substring(0, 50), // Truncate long user agents
    });
    return originalSend.call(this, data);
  };

  next();
});

// Connect DB
connectDB();

// Setup Routes
setupRoutes(app);

// 404 Handler
app.use((req, res) => {
  logger.warn("Route not found", {
    method: req.method,
    path: req.path,
  });
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
