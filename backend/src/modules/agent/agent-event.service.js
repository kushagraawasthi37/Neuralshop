import { AgentEvent } from "./agent-event.model.js";

export const recordAgentEvent = (data) => {
  const safe = {
    event: data.event,
    sessionId: String(data.sessionId || "unknown").slice(0, 120),
    userId: data.userId ? String(data.userId) : null,
    intent: String(data.intent || "unknown").slice(0, 80),
    tool: data.tool ? String(data.tool).slice(0, 80) : null,
    success: data.success !== false,
    latencyMs: Number.isFinite(data.latencyMs) ? data.latencyMs : 0,
    productIds: Array.isArray(data.productIds) ? data.productIds.slice(0, 20).map(String) : [],
    orderId: data.orderId ? String(data.orderId) : null,
    amount: Number.isFinite(data.amount) ? data.amount : 0,
    metadata: data.metadata && typeof data.metadata === "object" ? data.metadata : {},
  };
  return AgentEvent.create(safe).catch(() => null);
};

export const findAgentPaymentAttribution = async (orderId) => {
  if (!orderId) return null;
  return AgentEvent.findOne({ orderId, event: "agent_payment_started", success: true })
    .sort({ createdAt: -1 }).lean();
};

export const hasAgentCartAttribution = async (sessionId, productIds, since) => {
  if (!sessionId || !productIds?.length) return false;
  const event = await AgentEvent.findOne({
    sessionId,
    event: "agent_cart_action",
    tool: "add_to_cart",
    success: true,
    createdAt: { $gte: since || new Date(Date.now() - 24 * 60 * 60 * 1000) },
    productIds: { $in: productIds.map(String) },
  }).lean();
  return Boolean(event);
};

const dateRange = (startDate, endDate) => ({
  createdAt: {
    $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    $lte: endDate ? new Date(endDate) : new Date(),
  },
});

export const getAgentGrowthAnalyticsService = async ({ startDate, endDate } = {}) => {
  const range = dateRange(startDate, endDate);
  const [events, sessions, intentDistribution, toolUsage, dailySessions, topProducts] = await Promise.all([
    AgentEvent.find(range).select("event sessionId intent tool success latencyMs productIds orderId amount createdAt").lean(),
    AgentEvent.distinct("sessionId", { ...range, event: "agent_session_started" }),
    AgentEvent.aggregate([
      { $match: range },
      { $group: { _id: "$intent", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AgentEvent.aggregate([
      { $match: { ...range, tool: { $ne: null } } },
      { $group: { _id: "$tool", calls: { $sum: 1 }, failures: { $sum: { $cond: ["$success", 0, 1] } } } },
      { $sort: { calls: -1 } },
    ]),
    AgentEvent.aggregate([
      { $match: { ...range, event: "agent_session_started" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, sessions: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    AgentEvent.aggregate([
      { $match: { ...range, event: "agent_recommendation_generated" } },
      { $unwind: "$productIds" },
      { $group: { _id: "$productIds", recommendations: { $sum: 1 } } },
      { $sort: { recommendations: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const sessionIds = new Set(sessions);
  const eventSessions = new Set(events.map((event) => event.sessionId));
  const recommendations = events.filter((event) => event.event === "agent_recommendation_generated");
  const cartConversions = new Set(events.filter((event) => event.event === "agent_cart_action" && event.success).map((event) => event.sessionId));
  const purchases = events.filter((event) => event.event === "agent_payment_confirmed" && event.success);
  const completedSessions = new Set(events.filter((event) => event.event === "agent_completed" && event.success).map((event) => event.sessionId));
  const failedSessions = new Set(events.filter((event) => event.event === "agent_failed" || (event.event === "agent_tool_failed" && !event.success)).map((event) => event.sessionId));
  const latencies = events.map((event) => event.latencyMs).filter((value) => value > 0);
  const assistedRevenue = purchases.reduce((sum, event) => sum + (event.amount || 0), 0);

  return {
    sessions: sessionIds.size || eventSessions.size,
    productsRecommended: recommendations.reduce((sum, event) => sum + event.productIds.length, 0),
    cartConversions: cartConversions.size,
    purchases: purchases.length,
    conversionRate: sessionIds.size ? Number(((purchases.length / sessionIds.size) * 100).toFixed(2)) : 0,
    assistedRevenue,
    averageOrderValue: purchases.length ? assistedRevenue / purchases.length : 0,
    completedSessions: completedSessions.size,
    abandonedSessions: Math.max(0, sessionIds.size - completedSessions.size - failedSessions.size),
    failedTasks: failedSessions.size,
    averageLatencyMs: latencies.length ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length) : 0,
    dailySessions: dailySessions.map((entry) => ({ date: entry._id, sessions: entry.sessions })),
    intentDistribution: intentDistribution.map((entry) => ({ intent: entry._id, count: entry.count })),
    toolUsage: toolUsage.map((entry) => ({ tool: entry._id, calls: entry.calls, failures: entry.failures })),
    topRecommendedProducts: topProducts.map((entry) => ({ productId: entry._id, recommendations: entry.recommendations })),
  };
};
