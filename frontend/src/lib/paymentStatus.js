const CONFIRMED_STATUSES = new Set(["success", "paid", "captured"]);

export const isValidRazorpayPayment = (payment) =>
  Boolean(
    payment?.razorpayOrderId &&
    payment?.key &&
    Number.isFinite(Number(payment.amount)) &&
    Number(payment.amount) > 0,
  );

export const waitForPaymentConfirmation = async (
  getPayment,
  { attempts = 15, intervalMs = 1000 } = {},
) => {
  let latestPayment = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    latestPayment = await getPayment();
    if (CONFIRMED_STATUSES.has(String(latestPayment?.status).toLowerCase())) {
      return latestPayment;
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  throw new Error(
    `Payment confirmation pending (${latestPayment?.status || "unknown"})`,
  );
};
