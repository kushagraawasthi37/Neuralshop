import test from "node:test";
import assert from "node:assert/strict";
import { transitionCheckoutState } from "../src/modules/order/checkout-state.js";

test("checkout lifecycle permits only guarded forward transitions", () => {
  assert.equal(transitionCheckoutState("CREATED", "RESERVED"), "RESERVED");
  assert.equal(
    transitionCheckoutState("RESERVED", "PAYMENT_PENDING"),
    "PAYMENT_PENDING",
  );
  assert.equal(transitionCheckoutState("PAYMENT_PENDING", "PAID"), "PAID");
  assert.equal(transitionCheckoutState("PAID", "FULFILLED"), "FULFILLED");
  assert.throws(
    () => transitionCheckoutState("CREATED", "PAID"),
    /Invalid checkout state transition/,
  );
  assert.throws(
    () => transitionCheckoutState("PAID", "FAILED"),
    /Invalid checkout state transition/,
  );
});
