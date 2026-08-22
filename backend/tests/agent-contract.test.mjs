import test from "node:test";
import assert from "node:assert/strict";
import { normalizeToolCall, validateToolArguments } from "../src/modules/agent/agent.validator.js";
import { fallbackPlan } from "../src/modules/agent/agent.planner.js";

test("planner fallback creates a bounded catalog search", () => {
  const plan = fallbackPlan("Find a black outfit under ₹5000");
  assert.equal(plan.tool.name, "search_products");
  assert.equal(plan.tool.arguments.maxPrice, 5000);
});

test("validator rejects unknown tools and unsafe cart arguments", () => {
  assert.equal(normalizeToolCall({ name: "delete_user" }), null);
  const call = normalizeToolCall({ name: "add_to_cart", arguments: { productId: "507f1f77bcf86cd799439011" } });
  assert.equal(validateToolArguments(call.name, call.arguments), "a valid size is required");
});

test("payment language cannot become a payment tool", () => {
  const plan = fallbackPlan("Pay for it");
  assert.equal(plan.tool, null);
});
