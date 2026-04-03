/**
 * Central Configuration Management
 * All environment variables and app config in one place
 */

const getEnvVariable = (key, defaultValue = null) => {
  const value = process.env[key];
  if (!value && defaultValue === null) {
    console.warn(`⚠️  Environment variable ${key} is not set`);
  }
  return value || defaultValue;
};

export const config = {
  // App Config
  app: {
    name: getEnvVariable("APP_NAME", "NeuralShop Backend"),
    env: getEnvVariable("NODE_ENV", "development"),
    port: parseInt(getEnvVariable("PORT", "6000")),
    isDevelopment: getEnvVariable("NODE_ENV", "development") === "development",
    isProduction: getEnvVariable("NODE_ENV", "development") === "production",
  },

  // Frontend URLs
  frontend: {
    userUrl: getEnvVariable("FRONTEND_URL_USER", "http://localhost:3000"),
    adminUrl: getEnvVariable("FRONTEND_URL_ADMIN", "http://localhost:3001"),
  },

  // Database Config
  database: {
    mongoUrl: getEnvVariable("MONGO_URL"),
    postgresUrl: getEnvVariable("DATABASE_URL"),
  },

  // JWT Config
  jwt: {
    secret: getEnvVariable("JWT_SECRET"),
    expiryTime: getEnvVariable("JWT_EXPIRY_TIME", "7d"),
  },

  // Cloudinary Config
  cloudinary: {
    name: getEnvVariable("CLOUDINARY_NAME"),
    apiKey: getEnvVariable("CLOUDINARY_API_KEY"),
    apiSecret: getEnvVariable("CLOUDINARY_API_SECRET"),
  },

  // Redis Config
  redis: {
    host: getEnvVariable("REDIS_HOST", "localhost"),
    port: parseInt(getEnvVariable("REDIS_PORT", "6379")),
<<<<<<< HEAD
    password: getEnvVariable("REDIS_PASS", null),
=======
    password: getEnvVariable("REDIS_PASSWORD", null),
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
  },

  // Kafka Config
  kafka: {
    brokers: getEnvVariable("KAFKA_BROKERS", "localhost:9092").split(","),
    clientId: getEnvVariable("KAFKA_CLIENT_ID", "neural-shop"),
    groupId: getEnvVariable("KAFKA_GROUP_ID", "neural-shop-consumer-group"),
  },

  // Razorpay Config
  razorpay: {
    keyId: getEnvVariable("RAZORPAY_KEY_ID"),
    keySecret: getEnvVariable("RAZORPAY_KEY_SECRET"),
  },

<<<<<<< HEAD
  // SendGrid Config
  sendgrid: {
    apiKey: getEnvVariable("SENDGRID_API_KEY"),
    fromEmail: getEnvVariable("SENDGRID_FROM_EMAIL"),
  },

=======
>>>>>>> e46555d8f8e41a1394076e4977938949b8144567
  // Logging Config
  logging: {
    level: getEnvVariable("LOG_LEVEL", "debug"),
    enableFileLogging: getEnvVariable("ENABLE_FILE_LOGGING", "true") === "true",
    enableConsoleLogging:
      getEnvVariable("ENABLE_CONSOLE_LOGGING", "true") === "true",

    // File rotation settings
    maxFileSize: parseInt(getEnvVariable("LOG_MAX_FILE_SIZE", "5242880")), // 5MB
    maxFiles: parseInt(getEnvVariable("LOG_MAX_FILES", "5")),

    // Category-specific settings
    categories: {
      http: {
        enabled: getEnvVariable("LOG_HTTP_ENABLED", "true") === "true",
        maxFiles: parseInt(getEnvVariable("LOG_HTTP_MAX_FILES", "10")),
      },
      database: {
        enabled: getEnvVariable("LOG_DATABASE_ENABLED", "true") === "true",
        maxFiles: parseInt(getEnvVariable("LOG_DB_MAX_FILES", "10")),
      },
      auth: {
        enabled: getEnvVariable("LOG_AUTH_ENABLED", "true") === "true",
        maxFiles: parseInt(getEnvVariable("LOG_AUTH_MAX_FILES", "15")),
      },
      performance: {
        enabled: getEnvVariable("LOG_PERFORMANCE_ENABLED", "true") === "true",
        maxFiles: parseInt(getEnvVariable("LOG_PERF_MAX_FILES", "10")),
        threshold: parseInt(getEnvVariable("LOG_PERF_THRESHOLD_MS", "1000")), // Alert if operation > 1s
      },
      payment: {
        enabled: getEnvVariable("LOG_PAYMENT_ENABLED", "true") === "true",
        maxFiles: parseInt(getEnvVariable("LOG_PAYMENT_MAX_FILES", "20")),
      },
    },
  },

  // Cors Config
  cors: {
    origin: [
      getEnvVariable("FRONTEND_URL_USER", "http://localhost:3000"),
      getEnvVariable("FRONTEND_URL_ADMIN", "http://localhost:3001"),
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  // Cookie Config
  cookie: {
    httpOnly: true,
    secure: getEnvVariable("NODE_ENV", "development") === "production",
    sameSite:
      getEnvVariable("NODE_ENV", "development") === "production"
        ? "none"
        : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Rate Limiting Config (future use)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
};

export default config;
