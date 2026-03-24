export const orderEvents = {
  ORDER_CREATED: "order.created",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_SHIPPED: "order.shipped",
  ORDER_DELIVERED: "order.delivered",
};

export const paymentEvents = {
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
};

export const inventoryEvents = {
  STOCK_UPDATED: "inventory.stock_updated",
  STOCK_LOW: "inventory.stock_low",
};
