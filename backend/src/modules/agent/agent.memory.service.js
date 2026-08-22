import redisClient from "../../config/redis.js";

const TTL_SECONDS = 30 * 60;
const keyFor = (sessionId, ownerId = "guest") => `agent:session:${ownerId}:${sessionId}`;

export const readAgentMemory = async (sessionId, ownerId = "guest") => {
  if (!sessionId) return {};
  try {
    const value = await redisClient.get(keyFor(sessionId, ownerId));
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

export const writeAgentMemory = async (sessionId, patch, ownerId = "guest") => {
  if (!sessionId) return patch;
  try {
    const current = await readAgentMemory(sessionId, ownerId);
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await redisClient.set(keyFor(sessionId, ownerId), JSON.stringify(next), "EX", TTL_SECONDS);
    return next;
  } catch {
    return patch;
  }
};

export const deleteAgentMemory = async (sessionId, ownerId = "guest") => {
  if (!sessionId) return;
  try { await redisClient.del(keyFor(sessionId, ownerId)); } catch { /* Redis is optional for continuity. */ }
};

export const claimPaymentConfirmation = async (sessionId, ownerId = "guest") => {
  if (!sessionId) return null;
  const key = keyFor(sessionId, ownerId);
  try {
    await redisClient.watch(key);
    const value = await redisClient.get(key);
    const current = value ? JSON.parse(value) : {};
    if (current.pendingAction !== "payment_confirmation" || !current.preparedOrderId) {
      await redisClient.unwatch();
      return null;
    }
    const next = { ...current, pendingAction: "payment_started", state: "PAYMENT_STARTED", updatedAt: new Date().toISOString() };
    const result = await redisClient.multi().set(key, JSON.stringify(next), "EX", TTL_SECONDS).exec();
    return result ? next : null;
  } catch {
    try { await redisClient.unwatch(); } catch { /* best effort */ }
    return null;
  }
};
