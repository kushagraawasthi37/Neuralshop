import prisma from "../../prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { getCartService, clearCartService } from "../cart/cart.service.js";
import {
  reserveStockService,
  deductStockService,
  releaseStockService,
} from "../inventory/inventory.service.js";
import { Product } from "../product/product.model.js";
import { produceOrderEvent } from "../../events/producers/order.producer.js";
import { orderEvents } from "../../events/event-types.js";

/* Checked
 * ♻️ Idempotency-protected order creation service
 * 🔒 Uses transactions for order + orderItems creation
 * 🔁 Reserves stock atomically to prevent overselling
 */
export const createOrderService = async (userId, addressId, idempotencyKey) => {
  // Validate address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) {
    throw new ApiError(400, "Invalid address", [], "order");
  }
  // ♻️ Reserve idempotency entry early to guard against duplicate requests
  let idempotencyRecord = null;
  if (idempotencyKey) {
    idempotencyRecord = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (idempotencyRecord) {
      if (idempotencyRecord.status === "completed") {
        return idempotencyRecord.response;
      }

      throw new ApiError(
        409,
        "Duplicate order request in progress or already created",
        [],
        "order",
      );
    }

    try {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId,
          method: "POST",
          endpoint: "/orders",
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

  // Validate cart
  const cart = await getCartService(userId);
  if (!cart || !cart.items.length) {
    throw new ApiError(400, "Cart is empty", [], "order");
  }

  // Validate cart items and calculate total
  let totalAmount = 0;
  const orderItems = [];

  //Create order items and calculate total amount
  for (const item of cart.items) {
    // Validate product exists in MongoDB

    const cleanProductId = item.productId.trim();
    const product = await Product.findById(cleanProductId);
    if (!product) {
      throw new ApiError(
        400,
        `Product ${item.productId} not found`,
        [],
        "order",
      );
    }

    const sizeEntry = product.sizes.find((s) => s.size === item.size);
    if (!sizeEntry) {
      throw new ApiError(
        400,
        `Size ${item.size} not available for product ${item.productId}`,
        [],
        "order",
      );
    }

    if (item.quantity > sizeEntry.stock) {
      throw new ApiError(
        400,
        `Insufficient stock for ${item.productId} size ${item.size}`,
        [],
        "order",
      );
    }

    totalAmount += item.quantity * item.priceAtAdd;
    orderItems.push({
      productId: cleanProductId,
      sellerId: product.owner.toString(), // 🔥 Use owner from product as sellerId
      quantity: item.quantity,
      price: item.priceAtAdd,
    });
  }

  // 🔒 Reserve stock atomically for all items
  const reservedItems = [];
  try {
    for (const item of orderItems) {
      const cleanProductId = item.productId.trim();
      await reserveStockService(cleanProductId, item.quantity);
      reservedItems.push(item);
    }
  } catch (error) {
    // Release any reserved stock on failure
    for (const item of reservedItems) {
      const cleanProductId = item.productId.trim();
      await releaseStockService(cleanProductId, item.quantity).catch(() => {});
    }
    throw error;
  }

  // 🔒 Create order in transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          addressId,
          status: "PENDING", // 🔥 UPDATED: Use uppercase as per schema
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          sellerId: item.sellerId, // 🔥 NEW: Include sellerId
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // ♻️ Store idempotency response
      if (idempotencyKey) {
        await tx.idempotencyKey.upsert({
          where: { key: idempotencyKey },
          update: {
            response: { orderId: order.id, status: "PENDING" },
            status: "completed",
          },
          create: {
            key: idempotencyKey,
            userId,
            method: "POST",
            endpoint: "/orders",
            response: { orderId: order.id, status: "PENDING" },
            status: "completed",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
      }

      return order;
    });

    const payload = { orderId: result.id, status: "PENDING", totalAmount };

    try {
      await produceOrderEvent(orderEvents.ORDER_CREATED, {
        orderId: result.id,
        userId,
        totalAmount,
        status: "PENDING",
        items: orderItems,
      });
    } catch (error) {
      console.error("Failed to produce order.created event:", error);
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

/*Checked
 * Get orders for a user
 */
export const getOrdersService = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      payment: true,
      address: true, // Include address information
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
};

/*Checked
 * Get order by ID
 */
export const getOrderByIdService = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId, // Ensure user can only access their own orders
    },
    include: {
      items: true,
      payment: true,
      address: true, // Include address information
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found", [], "order");
  }

  return order;
};

/*Checked
 * Cancel order service
 * 🔁 Only allows cancellation if payment not completed
 */
export const cancelOrderService = async (userId, orderId) => {
  // 🔍 1. Get order with items + payment
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: true,
      payment: true,
    },
  });

  // ❌ Order not found
  if (!order) {
    throw new ApiError(404, "Order not found", [], "order");
  }

  // ❌ Only pending orders can be cancelled
  if (order.status !== "PENDING") {
    throw new ApiError(400, "Order cannot be cancelled", [], "order");
  }

  // ❌ Paid orders cannot be cancelled
  if (order.payment && order.payment.status === "success") {
    throw new ApiError(400, "Cannot cancel paid order", [], "order");
  }

  // 🔒 2. Transaction: cancel order + items + release stock
  await prisma.$transaction(async (tx) => {
    // ✅ Cancel order
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // ✅ Cancel ALL items
    await tx.orderItem.updateMany({
      where: { orderId },
      data: { status: "CANCELLED" },
    });

    // ✅ Restore stock (NO SIZE)
    for (const item of order.items) {
      await tx.$executeRaw`
        UPDATE "Inventory"
        SET 
          "reservedStock" = GREATEST("reservedStock" - ${item.quantity}, 0),
        WHERE "productId" = ${item.productId}
      `;
    }
  });

  // 📩 3. Kafka event (non-blocking)
  try {
    await produceOrderEvent(orderEvents.ORDER_CANCELLED, {
      orderId,
      userId,
      reason: "user_cancelled",
    });
  } catch (error) {
    console.error("Failed to produce order cancelled event:", error);
  }

  // ✅ Response
  return {
    orderId,
    status: "CANCELLED",
  };
};

// ============================================
// SELLER ORDER QUERIES (Admin)
// ============================================

/**
 * Get all orders for a seller (grouped by orderId, showing only seller's items)
 */
export const getSellerOrdersService = async (sellerId) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { sellerId },
    include: {
      order: {
        include: { payment: true, address: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const ordersMap = new Map();

  for (const item of orderItems) {
    if (!ordersMap.has(item.orderId)) {
      ordersMap.set(item.orderId, {
        id: item.order.id,
        status: item.order.status,
        createdAt: item.order.createdAt,
        payment: item.order.payment,
        address: item.order.address,
        items: [],
        sellerTotal: 0, // ✅ ADD THIS
      });
    }

    const order = ordersMap.get(item.orderId);

    // ✅ accumulate seller total
    const itemTotal = item.price * item.quantity;
    order.sellerTotal += itemTotal;

    order.items.push({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      status: item.status,
    });
  }

  return Array.from(ordersMap.values());
};

/**
 * Get specific order for a seller (with seller validation)
 */
export const getSellerOrderByIdService = async (sellerId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
      address: true, // ✅ ADD THIS
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found", [], "order");
  }

  // ✅ Filter seller items
  const sellerItems = order.items.filter((item) => item.sellerId === sellerId);

  if (sellerItems.length === 0) {
    throw new ApiError(
      403,
      "You do not have access to this order",
      [],
      "order",
    );
  }

  // ✅ Calculate seller total
  let sellerTotal = 0;
  for (const item of sellerItems) {
    sellerTotal += item.price * item.quantity;
  }

  // ✅ Clean response
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    payment: order.payment,
    address: order.address,

    totalAmount: order.totalAmount, // optional (full order)
    sellerTotal, // 🔥 IMPORTANT

    items: sellerItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      status: item.status,
    })),
  };
};

// ============================================
// ORDER ITEM STATUS MANAGEMENT
// ============================================

/**
 * 🔄 Update OrderItem status with seller validation and order status derivation
 * Status flow: PENDING → PROCESSING → SHIPPED → DELIVERED → CANCELLED
 */
export const updateOrderItemStatusService = async (
  sellerId,
  itemId,
  newStatus,
) => {
  // Validate status
  const validStatuses = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      [],
      "order",
    );
  }

  // 🔒 Transaction: Update item and derive order status
  const result = await prisma.$transaction(async (tx) => {
    // Get current item with order
    const item = await tx.orderItem.findUnique({
      where: { id: itemId },
      include: { order: { include: { items: true } } },
    });

    if (!item) {
      throw new ApiError(404, "Order item not found", [], "order");
    }

    // 🔐 Seller validation
    if (item.sellerId !== sellerId) {
      throw new ApiError(
        403,
        "You do not have permission to update this item",
        [],
        "order",
      );
    }

    const oldStatus = item.status;

    // Update item status
    const updatedItem = await tx.orderItem.update({
      where: { id: itemId },
      data: { status: newStatus },
    });

    // 🔄 Derive new order status from all items
    const allItems = item.order.items.map((i) =>
      i.id === itemId ? { ...i, status: newStatus } : i,
    );

    const derivedOrderStatus = deriveOrderStatus(allItems);

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: item.orderId },
      data: { status: derivedOrderStatus },
      include: { items: true, payment: true },
    });

    return {
      item: updatedItem,
      order: updatedOrder,
      oldStatus,
    };
  });

  // 📢 Produce events for SHIPPED and DELIVERED
  if (result.item.status === "SHIPPED") {
    try {
      await produceOrderEvent(orderEvents.ORDER_SHIPPED, {
        orderId: result.order.id,
        itemId: result.item.id,
        sellerId,
        productId: result.item.productId,
        quantity: result.item.quantity,
        status: "SHIPPED",
      });
    } catch (error) {
      console.error("Failed to produce ORDER_SHIPPED event:", error);
    }
  }

  if (result.item.status === "DELIVERED") {
    try {
      await produceOrderEvent(orderEvents.ORDER_DELIVERED, {
        orderId: result.order.id,
        itemId: result.item.id,
        sellerId,
        productId: result.item.productId,
        quantity: result.item.quantity,
        status: "DELIVERED",
      });
    } catch (error) {
      console.error("Failed to produce ORDER_DELIVERED event:", error);
    }
  }

  return result;
};

// ============================================
// ORDER STATUS DERIVATION (Business Logic)
// ============================================

/**
 * 🔄 Derive order status from all OrderItems
 * - All DELIVERED → COMPLETED
 * - All CANCELLED → CANCELLED
 * - Some SHIPPED → PARTIALLY_SHIPPED
 * - All PENDING → PENDING
 * - Otherwise → Processing based on mix
 */
export const deriveOrderStatus = (orderItems) => {
  if (!orderItems || orderItems.length === 0) {
    return "PENDING";
  }

  const statuses = orderItems.map((item) => item.status);
  const uniqueStatuses = new Set(statuses);

  // All same status checks
  if (uniqueStatuses.size === 1) {
    const status = statuses[0];
    if (status === "DELIVERED") return "COMPLETED";
    if (status === "CANCELLED") return "CANCELLED";
    if (status === "PENDING") return "PENDING";
    if (status === "PROCESSING") return "PROCESSING";
    if (status === "SHIPPED") return "SHIPPED";
  }

  // Mixed statuses
  const hasDelivered = statuses.includes("DELIVERED");
  const hasShipped = statuses.includes("SHIPPED");
  const hasProcessing = statuses.includes("PROCESSING");
  const hasPending = statuses.includes("PENDING");
  const hasCancelled = statuses.includes("CANCELLED");

  // Partial completion scenarios
  if (hasDelivered && !hasShipped && !hasProcessing && !hasPending) {
    // Some delivered, rest cancelled
    return "COMPLETED";
  }

  if (hasShipped && !hasDelivered && !hasProcessing && !hasPending) {
    // Some shipped, rest cancelled
    return "PARTIALLY_SHIPPED";
  }

  if (hasDelivered || hasShipped) {
    // Mix of statuses with some progress
    return "PARTIALLY_SHIPPED";
  }

  if (hasProcessing) {
    return "PROCESSING";
  }

  return "PENDING";
};

// ============================================
// BULK STATUS UPDATE (Admin)
// ============================================

/**
 * Bulk update multiple items' status (for sellers)
 */
export const bulkUpdateOrderItemStatusService = async (sellerId, updates) => {
  // updates = [ { itemId: "...", status: "SHIPPED" }, ... ]
  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const result = await updateOrderItemStatusService(
        sellerId,
        update.itemId,
        update.status,
      );
      results.push(result);
    } catch (error) {
      errors.push({
        itemId: update.itemId,
        error: error.message,
      });
    }
  }

  return {
    successful: results.length,
    failed: errors.length,
    results,
    errors,
  };
};
