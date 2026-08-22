import { fallbackPlan } from "../src/modules/agent/agent.planner.js";
import {
  normalizeToolCall,
  validateToolArguments,
} from "../src/modules/agent/agent.validator.js";
import { evaluateCandidateConstraints } from "../src/modules/agent/agent.evaluation.js";

const cases = [
  ["Find black formal wear under ₹5000", "search_products"],
  ["Find something under 3000", "search_products"],
  ["Find a birthday gift", "search_products"],
  ["Find a product available in M", "search_products"],
  ["Prepare checkout", "prepare_order"],
  ["Prepare my order", "prepare_order"],
  ["Compare these products", null],
  ["Save the second option to my wishlist", null],
  ["Pay for it", null],
  ["Find a premium outfit under ₹10,000", "search_products"],
  ["Find something similar to my last purchase", "search_products"],
  ["Show me the best option", "search_products"],
  ["Find a jacket", "search_products"],
  ["Find a dress below 7000", "search_products"],
  ["Is this in stock?", null],
  ["Add the best one in medium", null],
  ["Find wedding clothing", "search_products"],
  ["Find premium apparel", "search_products"],
  ["Find something rated highly under 4000", "search_products"],
  ["Prepare order for checkout", "prepare_order"],
];

let intentCorrect = 0;
let toolCorrect = 0;
let invalidActions = 0;
let completedTasks = 0;
for (const [request, expectedTool] of cases) {
  const plan = fallbackPlan(request);
  if (plan.intent !== "unknown") intentCorrect += 1;
  if ((plan.tool?.name || null) === expectedTool) toolCorrect += 1;
  if ((plan.tool?.name || null) === expectedTool) completedTasks += 1;
  if (plan.tool && !normalizeToolCall(plan.tool)) invalidActions += 1;
}
const malformed = [
  null,
  {},
  { name: "delete_database" },
  { name: "add_to_cart", arguments: { productId: "x" } },
];
const malformedHandled = malformed.filter((value) => {
  const normalized = normalizeToolCall(value);
  return (
    !normalized ||
    Boolean(validateToolArguments(normalized.name, normalized.arguments))
  );
}).length;
const constraintCases = [
  [
    "Black wedding outfit under ₹10000 in M",
    {
      id: "1",
      name: "Black wedding apparel",
      category: "apparel",
      price: 7499,
      sizes: [{ size: "M" }],
      availableStock: 2,
    },
    true,
  ],
  [
    "Black wedding outfit under ₹10000 in M",
    {
      id: "2",
      name: "Black wedding apparel",
      category: "apparel",
      price: 12000,
      sizes: [{ size: "M" }],
      availableStock: 2,
    },
    false,
  ],
  [
    "Black wedding outfit under ₹10000 in M",
    {
      id: "3",
      name: "Black wedding apparel",
      category: "apparel",
      price: 7499,
      sizes: [{ size: "L" }],
      availableStock: 0,
    },
    false,
  ],
];
const constraintSatisfied = constraintCases.filter(
  ([request, candidate, expected]) =>
    evaluateCandidateConstraints(request, candidate).satisfied === expected,
).length;
const constraintViolations = constraintCases.length - constraintSatisfied;
const percent = (value) => `${Math.round((value / cases.length) * 100)}%`;
console.log(
  `Agent Evaluation\n----------------\nPlanner Intent Coverage: ${percent(intentCorrect)}\nTool Selection Accuracy: ${percent(toolCorrect)}\nConstraint Evaluation: ${constraintSatisfied}/${constraintCases.length}\nInvalid Tool Calls: ${invalidActions}\nMalformed Output Cases Handled: ${malformedHandled}/${malformed.length}\nFallback Success: ${percent(cases.filter(([request]) => fallbackPlan(request).intent !== "unknown").length)}\nTask Completion Rate: ${percent(completedTasks)}\nConstraint Violations: ${constraintViolations}/${constraintCases.length}\nHallucination/Constraint Violation Rate: ${((constraintViolations / constraintCases.length) * 100).toFixed(2)}%\nLatency: Not measured (unit harness)\nDataset Cases: ${cases.length}`,
);
