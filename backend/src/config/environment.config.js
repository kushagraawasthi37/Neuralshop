// ─── Fail-Fast Environment Configuration ─────────────────────────────────
// Validates and coerces all environment variables at startup.
// If a REQUIRED variable is missing the process crashes immediately with a
// clear error message rather than failing silently 5 requests later.
//
// WHY fail-fast: "undefined is not a function" 10 requests in is much harder
// to debug than "MISSING ENV: JWT_SECRET" at process.stdout on startup.

// ─── Helpers ──────────────────────────────────────────────────────────────
const missing = [];

const required = (key) => {
  const value = process.env[key];
  if (!value || !value.trim()) {
    missing.push(key);
    return "";
  }
  return value;
};

const optional = (key, defaultValue = "") => process.env[key] ?? defaultValue;

const optionalInt = (key, defaultValue) => {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) {
    console.error(`ENV ERROR: ${key} must be an integer, got "${val}"`);
    missing.push(key);
    return defaultValue;
  }
  return parsed;
};

const optionalUrl = (key, defaultValue) => {
  const val = process.env[key];
  if (!val) return defaultValue;
  try {
    new URL(val);
    return val;
  } catch {
    console.error(`ENV ERROR: ${key} must be a valid URL, got "${val}"`);
    missing.push(key);
    return defaultValue;
  }
};

const isDev = optional("NODE_ENV", "development") === "development";
const isProd = optional("NODE_ENV", "development") === "production";

// ─── Configuration ────────────────────────────────────────────────────────
export const config = {
  app: {
    name: optional("APP_NAME", "NeuralShop Backend"),
    env: optional("NODE_ENV", "development"),
    port: optionalInt("PORT", 8000),
    isDevelopment: isDev,
    isProduction: isProd,
  },

  frontend: {
    userUrl: optional("FRONTEND_URL_USER", "http://localhost:5173"),
    adminUrl: optional("FRONTEND_URL_ADMIN", "http://localhost:5174"),
  },

  database: {
    mongoUrl: required("MONGO_URL"),
    postgresUrl: required("DATABASE_URL"),
  },

  jwt: {
    secret: required("JWT_SECRET"),
    refreshSecret: optional("JWT_REFRESH_SECRET"), // falls back to JWT_SECRET if missing
    expiryTime: optional("JWT_EXPIRY_TIME", "15m"),
  },

  cloudinary: {
    name: required("CLOUDINARY_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET"),
  },

  redis: {
    url: optional("REDIS_URL", "redis://localhost:6379"),
  },

  kafka: {
    broker: optional("KAFKA_BROKER", "localhost:9092"),
    clientId: optional("KAFKA_CLIENT_ID", "neural-shop"),
    groupId: optional("KAFKA_GROUP_ID", "neural-shop-consumer-group"),
    username: optional("KAFKA_USERNAME", ""),
    password: optional("KAFKA_PASSWORD", ""),
  },

  google: {
    clientId: optional("GOOGLE_CLIENT_ID"),
  },

  razorpay: {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    // webhookSecret used in webhookVerification.middleware.js
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },

  groq: {
    apiKey: required("GROQ_API_KEY"),
  },

  sendgrid: {
    apiKey: required("SENDGRID_API_KEY"),
    fromEmail: required("SENDGRID_FROM_EMAIL"),
  },

  elasticsearch: {
    node: optional("ELASTICSEARCH_NODE", "http://localhost:9200"),
    key: optional("ELASTICSEARCH_API_KEY"),
  },

  logging: {
    level: optional("LOG_LEVEL", isDev ? "debug" : "info"),
    enableFileLogging: optional("ENABLE_FILE_LOGGING", "true") === "true",
    enableConsoleLogging: optional("ENABLE_CONSOLE_LOGGING", "true") === "true",
    maxFileSize: optionalInt("LOG_MAX_FILE_SIZE", 5_242_880),
    maxFiles: optionalInt("LOG_MAX_FILES", 5),
    categories: {
      performance: {
        threshold: optionalInt("LOG_PERF_THRESHOLD_MS", 1000),
      },
    },
  },

  cors: {
    origin: [
      optional("FRONTEND_URL_USER", "http://localhost:5173"),
      optional("FRONTEND_URL_ADMIN", "http://localhost:5174"),
      "http://localhost:4173",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://neuralshop-usermode.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", //CSRF(Cross-Site Request Forgery) attack.
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
};

// ─── Fail-fast check ──────────────────────────────────────────────────────
// In production every required variable must be present.
// In development print warnings but don't crash (allows local dev without full stack).
if (missing.length > 0) {
  const msg = `\n\n🔴 MISSING REQUIRED ENVIRONMENT VARIABLES:\n  ${missing.join("\n  ")}\n\nSet these in your .env file. See .env.example for reference.\n`;
  if (isProd) {
    console.error(msg);
    process.exit(1);
  } else {
    console.warn(msg);
  }
}

export default config;
