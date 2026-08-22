import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

process.env.NODE_ENV = "development";
process.env.RAZORPAY_WEBHOOK_SECRET = "webhook-test-secret";

const { default: verifyRazorpaySignature } =
  await import("../src/middlewares/webhookVerification.middleware.js");

const runMiddleware = (body, signature) => {
  const req = {
    body,
    headers: { "x-razorpay-signature": signature },
    ip: "127.0.0.1",
  };
  const response = { locals: {}, statusCode: null, payload: null };
  const res = {
    locals: response.locals,
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(payload) {
      response.payload = payload;
      return this;
    },
  };
  let nextCalled = false;
  verifyRazorpaySignature(req, res, () => {
    nextCalled = true;
  });
  return { req, response, nextCalled };
};

const rawPayload = Buffer.from(
  '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123","order_id":"order_123"}}}}',
);
const signature = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawPayload)
  .digest("hex");

test("accepts an authentic Razorpay signature over raw webhook bytes", () => {
  const result = runMiddleware(rawPayload, signature);

  assert.equal(result.nextCalled, true);
  assert.equal(result.response.statusCode, null);
  assert.equal(result.req.body.event, "payment.captured");
});

test("rejects a tampered payload with the original signature", () => {
  const tamperedPayload = Buffer.from(
    rawPayload.toString().replace("pay_123", "pay_attacker"),
  );
  const result = runMiddleware(tamperedPayload, signature);

  assert.equal(result.nextCalled, false);
  assert.equal(result.response.statusCode, 400);
  assert.equal(result.response.payload.message, "Invalid webhook signature");
});
