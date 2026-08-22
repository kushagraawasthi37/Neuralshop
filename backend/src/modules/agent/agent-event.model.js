import mongoose from "mongoose";

const agentEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, default: null, index: true },
    intent: { type: String, default: "unknown", index: true },
    tool: { type: String, default: null, index: true },
    success: { type: Boolean, default: true, index: true },
    latencyMs: { type: Number, default: 0 },
    productIds: { type: [String], default: [] },
    orderId: { type: String, default: null, index: true },
    amount: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

agentEventSchema.index({ createdAt: -1 });
agentEventSchema.index({ event: 1, createdAt: -1 });
agentEventSchema.index({ userId: 1, createdAt: -1 });
agentEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const AgentEvent = mongoose.model("AgentEvent", agentEventSchema);
