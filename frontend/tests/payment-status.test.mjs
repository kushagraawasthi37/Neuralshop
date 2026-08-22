import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidRazorpayPayment,
  waitForPaymentConfirmation,
} from "../src/lib/paymentStatus.js";

test("invalid Razorpay responses are rejected before checkout opens", () => {
  assert.equal(isValidRazorpayPayment({ razorpayOrderId: "order_123" }), false);
  assert.equal(
    isValidRazorpayPayment({
      key: "rzp_test",
      amount: 0,
      razorpayOrderId: "order_123",
    }),
    false,
  );
  assert.equal(
    isValidRazorpayPayment({
      key: "rzp_test",
      amount: 5000,
      razorpayOrderId: "order_123",
    }),
    true,
  );
});

test("does not confirm until a delayed webhook changes payment status", async () => {
  const statuses = ["pending", "pending", "success"];
  let calls = 0;
  const payment = await waitForPaymentConfirmation(
    async () => {
      calls += 1;
      return { status: statuses.shift() };
    },
    { attempts: 3, intervalMs: 0 },
  );

  assert.equal(payment.status, "success");
  assert.equal(calls, 3);
});

test("does not resolve when the backend never confirms payment", async () => {
  await assert.rejects(
    () =>
      waitForPaymentConfirmation(async () => ({ status: "pending" }), {
        attempts: 2,
        intervalMs: 0,
      }),
    /Payment confirmation pending/,
  );
});
