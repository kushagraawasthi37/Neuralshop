import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";

await import("../src/config/loadenv.js");
process.env.MONGO_URL =
  "mongodb://neural:neural_secret@localhost:27017/neuralshop?authSource=admin";
process.env.DATABASE_URL =
  "postgresql://neural:neural_secret@localhost:5432/neuralshop?connection_limit=10&pool_timeout=20";
process.env.REDIS_URL = "redis://localhost:6379";

const { default: connectDB } = await import("../src/config/db.js");
const { default: prisma } = await import("../src/prisma/client.js");
const { User } = await import("../src/modules/user/user.model.js");
const { Product } = await import("../src/modules/product/product.model.js");
const { addItemToCartService, clearCartService, getCartService } =
  await import("../src/modules/cart/cart.service.js");
const { createOrderService } =
  await import("../src/modules/order/order.service.js");
const {
  initiatePaymentService,
  handleWebhookService,
  handlePaymentFailureService,
} = await import("../src/modules/payment/payment.service.js");
const { getStockService, reserveStockService, releaseStockService } =
  await import("../src/modules/inventory/inventory.service.js");
const { default: verifyRazorpaySignature } =
  await import("../src/middlewares/webhookVerification.middleware.js");
const { default: kafkaInstance } = await import("../src/config/kafka.js");
const { default: redisClient } = await import("../src/config/redis.js");

let user;
let address;
let product;
let order;

before(async () => {
  await connectDB();
  await prisma.$connect();
  user = await User.findOne({ email: "fixture@neuralshop.local" });
  address = await prisma.address.findFirst({
    where: { userId: String(user._id) },
  });
  product = await Product.findOne({ sku: "FIXTURE-BLACK-WEDDING-M" });
  assert.ok(user && address && product, "fixtures must exist");
});

after(async () => {
  await prisma.$disconnect();
  await mongoose.disconnect().catch(() => {});
  if (kafkaInstance.producerConnected) {
    await kafkaInstance.producer.disconnect().catch(() => {});
    kafkaInstance.producerConnected = false;
  }
  await redisClient.quit().catch(() => {});
});

test("creates a reserved order with an exact cart snapshot", async () => {
  await clearCartService(String(user._id));
  await addItemToCartService(String(user._id), {
    productId: String(product._id),
    size: "M",
    quantity: 1,
    priceAtAdd: product.price,
    name: product.name,
    image: product.images[0],
  });
  const result = await createOrderService(
    String(user._id),
    address.id,
    `integration-order-${Date.now()}`,
  );
  order = await prisma.order.findUnique({
    where: { id: result.orderId },
    include: { items: true },
  });
  assert.equal(order.checkoutState, "RESERVED");
  assert.equal(order.checkoutSnapshot.length, 1);
  assert.equal(order.items[0].name, product.name);
});

test("initiates payment and processes a valid webhook only once", async () => {
  const payment = await initiatePaymentService(
    String(user._id),
    order.id,
    `integration-payment-${Date.now()}`,
  );
  assert.ok(payment.razorpayOrderId);
  const before = await getStockService(
    String(user._id),
    String(product._id),
    "M",
  );
  const body = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_integration_${Date.now()}`,
          order_id: payment.razorpayOrderId,
        },
      },
    },
  };
  assert.equal(
    (await handleWebhookService(body, `integration-webhook-${Date.now()}`))
      .status,
    "processed",
  );
  const afterFirst = await getStockService(
    String(user._id),
    String(product._id),
    "M",
  );
  assert.equal(afterFirst.totalStock, before.totalStock - 1);
  assert.equal(
    (
      await handleWebhookService(
        body,
        `integration-webhook-replay-${Date.now()}`,
      )
    ).status,
    "already_processed",
  );
  assert.deepEqual(
    await getStockService(String(user._id), String(product._id), "M"),
    afterFirst,
  );
});

test("rejects a tampered webhook before processing", () => {
  const rawBody = Buffer.from(
    JSON.stringify({ event: "payment.captured", payload: {} }),
  );
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const req = {
    body: Buffer.from(rawBody.toString().replace("captured", "failed")),
    headers: { "x-razorpay-signature": signature },
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
  verifyRazorpaySignature(req, res, () => {});
  assert.equal(response.statusCode, 400);
});

test("failed payment restores the checkout snapshot", async () => {
  await clearCartService(String(user._id));
  await addItemToCartService(String(user._id), {
    productId: String(product._id),
    size: "M",
    quantity: 1,
    priceAtAdd: product.price,
    name: product.name,
    image: product.images[0],
  });
  const failedOrder = await createOrderService(
    String(user._id),
    address.id,
    `integration-failed-order-${Date.now()}`,
  );
  await prisma.payment.create({
    data: {
      orderId: failedOrder.orderId,
      amount: product.price,
      provider: "razorpay",
      razorpayOrderId: `order_failed_${Date.now()}`,
      status: "pending",
    },
  });
  await handlePaymentFailureService(failedOrder.orderId, "integration_failure");
  const cart = await getCartService(String(user._id));
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].productId, String(product._id));
});

test("allows only one concurrent reservation when stock is limited", async () => {
  await prisma.inventory.updateMany({
    where: {
      adminId: String(user._id),
      productId: String(product._id),
      size: "L",
    },
    data: { totalStock: 8, reservedStock: 0 },
  });
  const results = await Promise.allSettled([
    reserveStockService(String(user._id), String(product._id), "L", 6),
    reserveStockService(String(user._id), String(product._id), "L", 6),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    1,
  );
  await releaseStockService(String(user._id), String(product._id), "L", 6);
});
