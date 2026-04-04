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

/*
 * ♻️ Idempotency-protected payment initiation service
 * Creates Razorpay order and stores payment record
 */
export const initiatePaymentService = async (
  userId,
  orderId,
  idempotencyKey,
) => {
  // ♻️ Reserve idempotency entry early to prevent duplicate payment initialization
  if (idempotencyKey) {
    const existingIdempotency = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingIdempotency) {
      if (existingIdempotency.status === "completed") {
        return existingIdempotency.response;
      }

      throw new ApiError(
        409,
        "Duplicate payment initiation request in progress or already processed",
        [],
        "payment",
      );
    }

    try {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId,
          method: "POST",
          endpoint: `/orders/${orderId}/pay`,
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
          return existing.response;
        }
      }
      throw error;
    }
  }

  // Get order details
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

  if (order.payment) {
    throw new ApiError(
      400,
      "Payment already initiated for this order",
      [],
      "payment",
    );
  }

  if (!razorpayInstance) {
    throw new ApiError(500, "Payment gateway not configured", [], "payment");
  }

  // Create Razorpay order
  const razorpayOrderOptions = {
    amount: Math.round(order.totalAmount * 100), // Convert to paisa
    currency: "INR",
    receipt: `order_${orderId}`,
    payment_capture: 1, // Auto capture
  };

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create(razorpayOrderOptions);
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to create payment order",
      [error.message],
      "payment",
    );
  }

  // 🔒 Create payment record in transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          provider: "razorpay",
          razorpayOrderId: razorpayOrder.id,
          status: "pending",
        },
      });

      // ♻️ Store idempotency response
      if (idempotencyKey) {
        await tx.idempotencyKey.upsert({
          where: { key: idempotencyKey },
          update: {
            response: {
              paymentId: payment.id,
              razorpayOrderId: razorpayOrder.id,
              amount: order.totalAmount,
              currency: "INR",
            },
            status: "completed",
          },
          create: {
            key: idempotencyKey,
            userId,
            method: "POST",
            endpoint: `/orders/${orderId}/pay`,
            response: {
              paymentId: payment.id,
              razorpayOrderId: razorpayOrder.id,
              amount: order.totalAmount,
              currency: "INR",
            },
            status: "completed",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }

      return {
        paymentId: payment.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: "INR",
        key: config.razorpay.keyId,
      };
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
      console.error("Failed to produce payment.initiated event:", error);
    }

    return payload;
  } catch (error) {
    if (idempotencyKey) {
      await prisma.idempotencyKey.updateMany({
        where: { key: idempotencyKey, status: "pending" },
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
  // ♻️ Check idempotency for webhook
  if (idempotencyKey) {
    const existingIdempotency = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingIdempotency) {
      if (existingIdempotency.status === "completed") {
        return { status: "already_processed" };
      }

      return { status: "already_processing" };
    }

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
      //  P2002 error code signifies a unique constraint violation, occurring when a create or update operation attempts to insert a value that already exists in a database column marked as @unique or @id
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
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(JSON.stringify(webhookBody))
      .digest("hex");

    //ye check karta hai ki webhook Razorpay se hi aaya hai ya fake request hai
    // Body ko hash karta hai
    // Signature compare karta hai
    if (signature !== expectedSignature) {
      throw new ApiError(400, "Invalid webhook signature", [], "payment");
    }

    const { event, payload } = webhookBody;

    if (event !== "payment.captured") {
      // Only process successful payments
      return { status: "ignored" };
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

    // 🔒 Mark payment success before stock deduction
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "success",
          razorpayPaymentId,
        },
      });

      // Note: Order status is derived from OrderItems, not manually set
    });

    // Deduct reserved stock after payment success
    for (const item of payment.order.items) {
      await deductStockService(item.productId, item.quantity);
    }

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
      console.error("Failed to clear cart after payment success:", error);
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
      console.error("Failed to produce payment.success event:", error);
      // Don't fail the webhook processing if event production fails
    }

    return { status: "processed", orderId: payment.orderId };
  } catch (error) {
    if (idempotencyKey) {
      await prisma.idempotencyKey.updateMany({
        where: { key: idempotencyKey, status: "pending" },
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
    await releaseStockService(item.productId, item.quantity).catch(() => {});
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
