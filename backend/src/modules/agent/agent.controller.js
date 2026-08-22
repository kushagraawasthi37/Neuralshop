import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { runAgent } from "./agent.service.js";
import { claimPaymentConfirmation, readAgentMemory, writeAgentMemory } from "./agent.memory.service.js";
import { initiatePaymentService } from "../payment/payment.service.js";
import { recordAgentEvent } from "./agent-event.service.js";
import { ApiError } from "../../utils/api-error.js";
import { assertPaymentConfirmation } from "./agent.payment-policy.js";

export const chatWithAgent = asyncHandler(async (req, res) => {
  const { message, sessionId, addressId } = req.body;
  const result = await runAgent({ text: message, userId: req.userId, sessionId: sessionId || `web-${req.userId || req.ip}`, addressId });
  res.status(200).json(new ApiResponse(200, result, "Agent response generated"));
});

export const confirmAgentPayment = asyncHandler(async (req, res) => {
  const { sessionId, confirmed } = req.body;
  if (!sessionId) {
    throw new ApiError(400, "Agent session ID is required", [], "agent");
  }

  const currentMemory = await readAgentMemory(sessionId, req.userId);
  const policy = assertPaymentConfirmation({ confirmed, pendingAction: currentMemory.pendingAction, preparedOrderId: currentMemory.preparedOrderId, userId: req.userId });
  if (!policy.ok) throw new ApiError(policy.code === "EXPLICIT_CONFIRMATION_REQUIRED" ? 400 : 409, policy.message, [], "agent");
  const memory = await claimPaymentConfirmation(sessionId, req.userId);
  if (!memory) throw new ApiError(409, "Payment confirmation was already used or the session expired", [], "agent");
  const orderId = memory.preparedOrderId;

  const idempotencyKey = req.headers["idempotency-key"] || `agent-payment-${sessionId}-${orderId}`;
  let result;
  try {
    result = await initiatePaymentService(req.userId, orderId, idempotencyKey);
  } catch (error) {
    await writeAgentMemory(sessionId, { pendingAction: "payment_confirmation", state: "PAYMENT_CONFIRMATION_REQUIRED" }, req.userId);
    throw error;
  }
  recordAgentEvent({ event: "agent_payment_started", sessionId, userId: req.userId, orderId, amount: result.amount, success: true });

  res.status(200).json(new ApiResponse(200, result, "Payment initiated after explicit confirmation"));
});
