import mongoose from "mongoose";
import { performance } from "node:perf_hooks";
import { createConnection } from "node:net";

process.env.DOTENV_CONFIG_QUIET = "true";
await import("../src/config/loadenv.js");
process.env.ENABLE_CONSOLE_LOGGING = "false";
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};
console.log = () => {};
console.warn = () => {};
console.error = () => {};

const { Product } = await import("../src/modules/product/product.model.js");
const { listProductService } =
  await import("../src/modules/product/product.service.js");
const { runAgent } = await import("../src/modules/agent/agent.service.js");
const { evaluateCandidateConstraints } =
  await import("../src/modules/agent/agent.evaluation.js");
const { callGroq } = await import("../src/utils/groq.js");
const { default: prisma } = await import("../src/prisma/client.js");
const { default: redisClient } = await import("../src/config/redis.js");

const catalogQueries = [
  "black shirt under 3000",
  "premium wedding outfit",
  "size M formal wear",
  "cheap white sneakers",
  "black dress under 5000",
  "blue jacket",
  "white formal shirt",
  "wedding apparel under 10000",
  "rated black outfit",
  "premium apparel",
  "black casual wear",
  "gift under 3000",
  "formal jacket under 8000",
  "red dress",
  "green outfit",
  "top rated shirt",
  "size L wedding outfit",
  "cheapest apparel",
  "similar premium outfit",
  "black trousers",
  "white jacket",
  "formal shoes",
  "party wear",
  "summer outfit",
  "winter jacket",
  "black kurta",
  "wedding dress",
  "casual sneakers",
  "premium accessories",
];
let lastGroqError = null;

const services = {};
const latencies = [];
const live = (name, value) => {
  services[name] = value ? "available" : "unavailable";
};
const percentile = (values, p) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
};
const envConfigured = (name) => Boolean(String(process.env[name] || "").trim());

const probeHttp = async (url) => {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(3000) })).ok;
  } catch {
    return false;
  }
};

const probeTcp = (host, port) =>
  new Promise((resolve) => {
    const client = createConnection({ host, port: Number(port) });
    const finish = (value) => {
      client.destroy();
      resolve(value);
    };
    client.once("connect", () => finish(true));
    client.once("error", () => finish(false));
    setTimeout(() => finish(false), 2500);
  });

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);

const checkServices = async () => {
  const mongoAvailable = await probeTcp("localhost", 27017);
  const postgresAvailable = await probeTcp("localhost", 5432);
  const redisAvailable = await probeTcp("localhost", 6379);
  try {
    if (!mongoAvailable) throw new Error("unavailable");
    await withTimeout(
      mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 2500,
      }),
      3500,
    );
    live("MongoDB", true);
  } catch {
    live("MongoDB", false);
  }
  try {
    if (!postgresAvailable) throw new Error("unavailable");
    await withTimeout(prisma.$queryRaw`SELECT 1`, 3500);
    live("PostgreSQL", true);
  } catch {
    live("PostgreSQL", false);
  }
  try {
    if (!redisAvailable) throw new Error("unavailable");
    await withTimeout(redisClient.ping(), 3500);
    live("Redis", true);
  } catch {
    live("Redis", false);
  }
  live(
    "Elasticsearch",
    await probeHttp(
      `${process.env.ELASTICSEARCH_NODE || "http://localhost:9200"}/_cluster/health`,
    ),
  );
  const kafkaUrl = String(process.env.KAFKA_BROKER || "localhost:9092").split(
    ":",
  );
  live("Kafka", await probeTcp(kafkaUrl[0], Number(kafkaUrl[1] || 9092)));
};

const runCatalogValidation = async () => {
  if (services.MongoDB !== "available")
    return { status: "NOT MEASURED", reason: "MongoDB unavailable" };
  let checked = 0;
  let hallucinations = 0;
  const constraintResults = [];
  for (const query of catalogQueries) {
    const result = await listProductService({
      search: query,
      limit: 12,
      sort: "rating_desc",
    }).catch(() => ({ products: [] }));
    for (const product of result.products || []) {
      checked += 1;
      const exists = await Product.exists({ _id: product._id }).catch(
        () => null,
      );
      if (!exists || !product.name || product.price == null)
        hallucinations += 1;
      const constraints = evaluateCandidateConstraints(query, {
        ...product,
        id: String(product._id),
      });
      constraintResults.push(constraints.satisfied);
    }
  }
  return {
    status: "MEASURED",
    queries: catalogQueries.length,
    productsChecked: checked,
    hallucinatedProductRate: checked
      ? `${((hallucinations / checked) * 100).toFixed(2)}%`
      : "0%",
    constraintSatisfaction: constraintResults.length
      ? `${((constraintResults.filter(Boolean).length / constraintResults.length) * 100).toFixed(2)}%`
      : "NOT MEASURED",
  };
};

const runAgentJourney = async () => {
  if (services.MongoDB !== "available" || services.Redis !== "available")
    return {
      status: "NOT MEASURED",
      reason: "MongoDB and Redis are required for guest agent execution",
    };
  const sessionId = `live-validation-${Date.now()}`;
  const started = performance.now();
  const result = await runAgent({
    text: "I need a black wedding outfit under ₹10,000 in M",
    sessionId,
  });
  const products =
    result.data?.products ||
    (result.data?.product ? [result.data.product] : []);
  const verifiedProducts = products.filter((product) => product.id);
  const hallucinatedProducts = products.filter(
    (product) => !product.id || !product.name || product.price == null,
  );
  const liveConstraints = products.map(
    (product) =>
      evaluateCandidateConstraints("black wedding outfit under ₹10,000 in M", {
        ...product,
        id: String(product.id),
      }).satisfied,
  );
  return {
    status: "MEASURED",
    sessionId,
    steps: result.steps,
    llmCalls: result.llmCalls,
    latencyMs: Math.round(performance.now() - started),
    tool: result.tool,
    products: products
      .slice(0, 5)
      .map(({ id, name, price }) => ({ id, name, price })),
    hallucinatedProductRate: products.length
      ? `${((hallucinatedProducts.length / products.length) * 100).toFixed(2)}%`
      : "0.00%",
    constraintSatisfaction: liveConstraints.length
      ? `${((liveConstraints.filter(Boolean).length / liveConstraints.length) * 100).toFixed(2)}%`
      : "NOT MEASURED",
    constraintsSatisfied:
      verifiedProducts.length > 0 && liveConstraints.every(Boolean),
  };
};

const runLlmLatency = async () => {
  if (!envConfigured("GROQ_API_KEY"))
    return { status: "NOT MEASURED", reason: "GROQ_API_KEY unconfigured" };
  for (let i = 0; i < 20; i += 1) {
    const started = performance.now();
    try {
      await callGroq(
        [
          {
            role: "user",
            content: JSON.stringify({
              request: "Return JSON for a black shirt under 3000",
              iteration: i,
            }),
          },
        ],
        {
          model: "openai/gpt-oss-20b",
          temperature: 0,
          maxTokens: 80,
          jsonMode: false,
        },
      );
      latencies.push(performance.now() - started);
    } catch (error) {
      lastGroqError = error.message;
      break;
    }
  }
  if (!latencies.length)
    return {
      status: "NOT MEASURED",
      reason: lastGroqError || "Groq calls failed",
    };
  return {
    status: "MEASURED",
    requests: latencies.length,
    p50Ms: Math.round(percentile(latencies, 0.5)),
    p95Ms: Math.round(percentile(latencies, 0.95)),
    averageMs: Math.round(
      latencies.reduce((a, b) => a + b, 0) / latencies.length,
    ),
    maximumMs: Math.round(Math.max(...latencies)),
  };
};

try {
  await checkServices();
  const catalog = await runCatalogValidation();
  const journey = await runAgentJourney();
  const llm = await runLlmLatency();
  originalConsole.log(
    JSON.stringify(
      {
        services: {
          ...services,
          Groq: envConfigured("GROQ_API_KEY") ? "configured" : "unconfigured",
          Razorpay:
            envConfigured("RAZORPAY_KEY_ID") &&
            envConfigured("RAZORPAY_KEY_SECRET")
              ? "configured"
              : "unconfigured",
        },
        catalog,
        journey,
        liveLlmLatency: llm,
        paymentExecution: "NOT RUN: no financial transaction requested",
        taskCompletion:
          "NOT MEASURED: authenticated mutation workflow requires test user and seeded address",
        attributionReconciliation:
          "NOT MEASURED: requires seeded AgentEvent and verified webhook fixtures",
      },
      null,
      2,
    ),
  );
} finally {
  await mongoose.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  redisClient.disconnect();
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
}
