import api from "./axios";

export const agentApi = {
  chat: (message, sessionId, addressId) =>
    api.post("/agent/chat", { message, sessionId, addressId }),
  confirmPayment: (sessionId) =>
    api.post(
      "/agent/confirm-payment",
      { sessionId, confirmed: true },
      {
        headers: { "Idempotency-Key": `agent-payment-${sessionId}` },
      },
    ),
};
