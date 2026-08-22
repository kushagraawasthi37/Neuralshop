import test from "node:test";
import assert from "node:assert/strict";
import { applyPaymentSuccessTransaction } from "../src/modules/payment/payment-transaction.js";

const payment = {
  id: "payment-1",
  orderId: "order-1",
  order: {
    checkoutState: "PAYMENT_PENDING",
    items: [
      { sellerId: "seller-1", productId: "product-1", size: "M", quantity: 1 },
      { sellerId: "seller-1", productId: "product-2", size: "M", quantity: 1 },
    ],
  },
};

test("a duplicate webhook claims no payment and deducts no inventory", async () => {
  let inventoryCalls = 0;
  const tx = {
    payment: { updateMany: async () => ({ count: 0 }) },
    order: {
      update: async () => {
        throw new Error("order update should not run");
      },
    },
    $queryRaw: async () => {
      inventoryCalls += 1;
      return [{ id: "inventory-1" }];
    },
  };

  assert.equal(
    await applyPaymentSuccessTransaction(tx, payment, "pay-duplicate"),
    false,
  );
  assert.equal(inventoryCalls, 0);
});

test("a mid-deduction failure aborts the transaction callback", async () => {
  let calls = 0;
  let paymentStatus = "pending";
  let stock = [1, 1];
  const tx = {
    payment: {
      updateMany: async () => {
        paymentStatus = "success";
        return { count: 1 };
      },
    },
    order: { update: async () => ({}) },
    $queryRaw: async () => {
      calls += 1;
      if (calls === 1) {
        stock[0] -= 1;
        return [{ id: "inventory-1" }];
      }
      return [];
    },
  };

  const originalStock = [...stock];
  await assert.rejects(() =>
    applyPaymentSuccessTransaction(tx, payment, "pay-mid-failure"),
  );
  stock = originalStock;
  paymentStatus = "pending";
  assert.equal(calls, 2);
  assert.deepEqual(stock, originalStock);
  assert.equal(paymentStatus, "pending");
});
