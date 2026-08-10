import crypto from "crypto";
import config from "../config/environment.config.js";
import { logger } from "../utils/logger.js";

// ─── Razorpay Webhook Signature Verification ─────────────────────────────
// WHY raw body: Razorpay signs the raw request bytes with HMAC-SHA256.
// Once express.json() parses the body, the byte representation changes
// (key order, whitespace) and the signature check FAILS every time.
//
// Solution: the webhook route in app.js uses express.raw({ type: 'application/json' })
// BEFORE express.json() so this middleware receives the raw Buffer.
//
// HOW to test locally: use Razorpay's test mode + ngrok + Dashboard > Webhooks.

const verifyRazorpaySignature = (req, res, next) => {
  const receivedSignature = req.headers["x-razorpay-signature"];

  if (!receivedSignature) {
    logger.warn("Webhook: missing X-Razorpay-Signature header", {
      ip: req.ip,
      requestId: res.locals.requestId,
      category: "security",
    });
    return res.status(400).json({ success: false, message: "Missing webhook signature" });
  }

  if (!config.razorpay?.webhookSecret) {
    logger.error("Webhook: RAZORPAY_WEBHOOK_SECRET not configured", { category: "security" });
    return res.status(500).json({ success: false, message: "Webhook not configured" });
  }

  // req.body is a Buffer here (express.raw was applied to this route in app.js)
  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));

  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");

  // Use timingSafeEqual to prevent timing attacks
  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(receivedSignature, "hex");

  const isValid =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!isValid) {
    logger.warn("Webhook: invalid signature — possible forged request", {
      ip: req.ip,
      requestId: res.locals.requestId,
      category: "security",
    });
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  // Parse the raw body for downstream handlers
  try {
    req.body = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    return res.status(400).json({ success: false, message: "Invalid JSON in webhook body" });
  }

  logger.info("Webhook: signature verified", {
    event: req.body?.event,
    requestId: res.locals.requestId,
    category: "payment",
  });

  next();
};

export default verifyRazorpaySignature;
