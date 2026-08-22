export const assertPaymentConfirmation = ({ confirmed, pendingAction, preparedOrderId, userId }) => {
  if (!userId) return { ok: false, code: "AUTH_REQUIRED", message: "Authentication is required" };
  if (confirmed !== true) return { ok: false, code: "EXPLICIT_CONFIRMATION_REQUIRED", message: "Explicit payment confirmation is required" };
  if (pendingAction !== "payment_confirmation") return { ok: false, code: "NO_PENDING_PAYMENT", message: "There is no payment awaiting confirmation" };
  if (!preparedOrderId) return { ok: false, code: "NO_PREPARED_ORDER", message: "No prepared order is attached to this session" };
  return { ok: true };
};
