import prisma from "../../prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import {
  deductStockService,
  releaseStockService,
} from "../inventory/inventory.service.js";
import { clearCartService } from "../cart/cart.service.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import config from "../../config/environment.config.js";
import { producePaymentEvent } from "../../events/producers/payment.producer.js";
import { paymentEvents } from "../../events/event-types.js";

// Initialize Razorpay
let razorpayInstance = null;
if (config.razorpay?.keyId && config.razorpay?.keySecret) {
  razorpayInstance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

export const setPaymentGatewayForTests = (gateway) => {
  razorpayInstance = gateway;
};

const buildPaymentReceipt = (idempotencyKey) =>
  idempotencyKey
    ? `ord_${crypto.createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 24)}`
    : `ord_${crypto.randomBytes(8).toString("hex")}`;

const buildPaymentResult = (payment, razorpayKey) => ({
  paymentId: payment.id,
  razorpayOrderId: payment.razorpayOrderId,
  amount: payment.amount,
  currency: "INR",
  key: razorpayKey,
});

const getStoredResult = (response) => response?.result ?? response;

const findGatewayOrderByReceipt = async (receipt) => {
  if (!razorpayInstance?.orders?.all) return null;
  const orders = await razorpayInstance.orders.all({ receipt });
  return orders?.items?.find((order) => order.receipt === receipt) ?? null;
};

/*  Checked
 * ♻️ Idempotency-protected payment initiation service
 * Creates Razorpay order and stores payment record
 */
export const initiatePaymentService = async (
  userId,
  orderId,
  idempotencyKey,
) => {
  // Validate the order before creating durable payment state.
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) {
    throw new ApiError(404, "Order not found", [], "payment");
  }

  if (order.userId !== userId) {
    throw new ApiError(403, "Unauthorized access to order", [], "payment");
  }

  if (order.status !== "PENDING") {
    throw new ApiError(400, "Order is not in pending state", [], "payment");
  }

  if (!razorpayInstance) {
    throw new ApiError(500, "Payment gateway not configured", [], "payment");
  }

  const fingerprint = JSON.stringify({ userId, orderId, amount: order.totalAmount });
  const receipt = buildPaymentReceipt(idempotencyKey);

  // The key is a durable claim. Its fingerprint prevents reusing one key for
  // a different order or amount.
  if (idempotencyKey) {
    try {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId,
          method: "POST",
          endpoint: `/orders/${orderId}/pay`,
          response: { fingerprint },
          status: "pending",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    } catch (error) {
      if (error?.code === "P2002") {
        const existing = await prisma.idempotencyKey.findUnique({
          where: { key: idempotencyKey },
        });
        if (existing?.status === "completed") {
          if (existing.response?.fingerprint !== fingerprint) {
            throw new ApiError(409, "Idempotency key cannot be reused with a different payment", [], "payment");
          }
          return getStoredResult(existing.response);
        }
        if (existing?.response?.fingerprint && existing.response.fingerprint !== fingerprint) {
          throw new ApiError(409, "Idempotency key cannot be reused with a different payment", [], "payment");
        }
        if (existing?.status === "processing") {
          throw new ApiError(409, "Payment initiation is already in progress", [], "payment");
        }
      }
      throw error;
    }

    const claimed = await prisma.idempotencyKey.updateMany({
      where: { key: idempotencyKey, status: "pending" },
      data: { status: "processing", response: { fingerprint } },
    });
    if (claimed.count !== 1) {
      throw new ApiError(409, "Payment initiation is already in progress", [], "payment");
    }
  }

  // Persist the payment row before calling Razorpay. If the process dies after
  // gateway creation, the deterministic receipt lets the next attempt find it.
  let payment = order.payment;
  if (payment && !payment.razorpayOrderId && !idempotencyKey) {
    throw new ApiError(409, "Payment initiation is already in progress", [], "payment");
  }

  if (!payment) {
    try {
      payment = await prisma.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          provider: "razorpay",
          status: "pending",
        },
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
      payment = await prisma.payment.findUnique({ where: { orderId } });
    }
  }

  if (payment.razorpayOrderId) {
    const result = buildPaymentResult(payment, config.razorpay.keyId);
    if (idempotencyKey) {
      await prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { response: { fingerprint, result }, status: "completed" },
      });
    }
    return result;
  }

  const razorpayOrderOptions = {
    amount: Math.round(order.totalAmount * 100), // Convert to paisa
    currency: "INR",
    receipt,
    payment_capture: 1, // Auto capture
  };

  let razorpayOrder;
  try {
    razorpayOrder = await findGatewayOrderByReceipt(receipt);
    if (!razorpayOrder) {
      razorpayOrder = await razorpayInstance.orders.create(razorpayOrderOptions);
    }
  } catch (error) {
    if (idempotencyKey) {
      await prisma.idempotencyKey.updateMany({
        where: { key: idempotencyKey, status: "processing" },
        data: { status: "failed" },
      });
    }
    throw new ApiError(
      500,
      "Failed to create payment order",
      [error.message],
      "payment",
    );
  }

  // Attach the gateway order and finalize the durable idempotency response.
  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });

      const paymentResult = buildPaymentResult(updatedPayment, config.razorpay.keyId);

      if (idempotencyKey) {
        await tx.idempotencyKey.update({
          where: { key: idempotencyKey },
          data: { response: { fingerprint, result: paymentResult }, status: "completed" },
        });
      }

      return paymentResult;
    });

    const payload = result;

    try {
      await producePaymentEvent(paymentEvents.PAYMENT_INITIATED, {
        paymentId: result.paymentId,
        orderId,
        amount: result.amount,
        provider: "razorpay",
        razorpayOrderId: result.razorpayOrderId,
        status: "pending",
      });
    } catch (error) {
      // Silently handle event production errors
    }

    return payload;
  } catch (error) {
    if (idempotencyKey) {
      await prisma.idempotencyKey.updateMany({
        where: { key: idempotencyKey, status: { in: ["pending", "processing"] } },
        data: { status: "failed" },
      });
    }
    throw error;
  }
};

/*
 * ♻️ Idempotency-protected webhook handler
 * Processes Razorpay webhook and updates payment/order status
 */

// A webhook is an HTTP-based callback function that allows one application to send real-time data to another automatically when a specific event occurs
export const handleWebhookService = async (
  webhookBody,
  signature,
  idempotencyKey,
) => {
  // ♻️ Reserve webhook idempotency entry
  if (idempotencyKey) {
    try {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId: "system",
          method: "POST",
          endpoint: "/webhook",
          response: {},
          status: "pending",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    } catch (error) {
      if (error?.code === "P2002") {
        const existing = await prisma.idempotencyKey.findUnique({
          where: { key: idempotencyKey },
        });
        if (existing?.status === "completed") {
          return { status: "already_processed" };
        }
        if (existing?.status === "pending") {
          return { status: "already_processing" };
        }
      }
      throw error;
    }
  }

  try {
    const { event, payload } = webhookBody;

    if (event !== "payment.captured") {
      return { status: "ignored" };
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(JSON.stringify(webhookBody))
      .digest("hex");

    const signatureBuffer = Buffer.from(signature || "", "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new ApiError(400, "Invalid webhook signature", [], "payment");
    }

    // This is the actual payment object sent by Razorpay inside the webhook payload.
    const paymentEntity = payload.payment.entity;
    // This is the unique payment ID generated by Razorpay
    const razorpayPaymentId = paymentEntity.id;
    // This links the payment to the Razorpay order we created earlier
    const razorpayOrderId = paymentEntity.order_id;

    // Find payment by razorpay order ID
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      throw new ApiError(404, "Payment record not found", [], "payment");
    }

    if (payment.status === "success") {
      // ♻️ Already processed
      if (idempotencyKey) {
        await prisma.idempotencyKey.upsert({
          where: { key: idempotencyKey },
          update: { status: "completed" },
          create: {
            key: idempotencyKey,
            userId: payment.order.userId,
            method: "POST",
            endpoint: "/webhook",
            response: { status: "already_processed" },
            status: "completed",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }
      return { status: "already_processed" };
    }

    // ✅ Deduct reserved stock after payment success (with size)
    const deductedItems = [];
    try {
      for (const item of payment.order.items) {
        await deductStockService(
          item.sellerId,
          item.productId,
          item.size,
          item.quantity,
        );
        deductedItems.push(item);
      }
    } catch (error) {
      for (const item of deductedItems) {
        await releaseStockService(
          item.sellerId,
          item.productId,
          item.size,
          item.quantity,
        ).catch(() => {});
      }
      throw error;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "success",
        razorpayPaymentId,
      },
    });

    // Note: Order status will be derived from OrderItems after payment processing

    if (idempotencyKey) {
      await prisma.idempotencyKey.upsert({
        where: { key: idempotencyKey },
        update: {
          status: "completed",
          response: { status: "processed", orderId: payment.orderId },
        },
        create: {
          key: idempotencyKey,
          userId: payment.order.userId,
          method: "POST",
          endpoint: "/webhook",
          response: { status: "processed", orderId: payment.orderId },
          status: "completed",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    // Clear user's cart after payment is fully processed
    try {
      await clearCartService(payment.order.userId);
    } catch (error) {
      // Silently handle cart clear errors to not fail webhook processing
    }

    // Produce Kafka event for payment success
    try {
      await producePaymentEvent(paymentEvents.PAYMENT_SUCCESS, {
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        provider: "razorpay",
        razorpayPaymentId,
        razorpayOrderId,
        status: "success",
      });
    } catch (error) {
      // Silently handle event production errors to not fail webhook processing
    }

    return { status: "processed", orderId: payment.orderId };
  } catch (error) {
    if (idempotencyKey) {
      await prisma.idempotencyKey.updateMany({
        where: { key: idempotencyKey, status: { in: ["pending", "processing"] } },
        data: { status: "failed" },
      });
    }

    throw error;
  }
};

/**
 * Get payment details for an order
 */
export const getPaymentService = async (userId, orderId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      orderId,
      order: { userId }, // Ensure user owns the order
    },
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found", [], "payment");
  }

  return payment;
};

/**
 * Handle payment failure (webhook or manual)
 */
export const handlePaymentFailureService = async (orderId, reason) => {
  const payment = await prisma.payment.findFirst({
    where: { orderId },
    include: { order: { include: { items: true } } },
  });

  if (!payment) {
    throw new ApiError(404, "Payment record not found", [], "payment");
  }

  if (payment.status === "failed") {
    return { status: "already_failed" };
  }

  // 🔒 Update payment and release stock in transaction
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });
  });

  // Release reserved stock
  for (const item of payment.order.items) {
    await releaseStockService(
      item.sellerId,
      item.productId,
      item.size,
      item.quantity,
    ).catch(() => {});
  }

  // Produce Kafka event for payment failure
  try {
    await producePaymentEvent(paymentEvents.PAYMENT_FAILED, {
      paymentId: payment.id,
      orderId,
      amount: payment.amount,
      provider: "razorpay",
      razorpayOrderId: payment.razorpayOrderId,
      status: "failed",
      reason: reason || "payment_failed",
    });
  } catch (error) {
    console.error("Failed to produce payment failed event:", error);
    // Don't fail the failure handling if event production fails
  }

  return { status: "failed", orderId };
};
