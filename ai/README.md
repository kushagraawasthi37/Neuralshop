# AI System — NeuralShop Agent

## Summary

NeuralShop's AI component is a commerce agent: it understands natural-language
shopping requests (e.g. "black wedding jacket under ₹10,000 in size M"), searches
the catalog, checks inventory, and prepares a checkout — but it never completes a
payment itself. Payment confirmation is always handled by Razorpay webhooks,
verified independently of the agent.

## Definitions

- **LLM (Large Language Model):** the AI model (here, Groq's `openai/gpt-oss-20b`)
  that interprets natural-language requests and decides what action to take next.
- **Agentic:** the system doesn't just answer questions — it takes multi-step
  actions (search → check inventory → add to cart → prepare checkout) using tools,
  deciding each next step based on the result of the previous one.
- **RAG (Retrieval-Augmented Generation):** a technique where a model retrieves
  relevant documents/data before generating a response. NeuralShop does not use this.
- **HMAC (Hash-based Message Authentication Code):** a cryptographic method used
  here to verify that a Razorpay webhook payload is authentic and untampered,
  covered in `backend/README.md`.

## Scope & Limitations

- Model: Groq, `openai/gpt-oss-20b`. This replaced a deprecated model that returned
  `model_not_found` (see Challenges #4 below).
- Uses bounded/allowlisted tool calls, Redis session memory, and a deterministic
  fallback planner when the LLM is unavailable.
- Does **not** use RAG, embeddings, vector search, fine-tuning, or a separate
  knowledge base.
- Does **not** perform payment capture — the agent prepares checkout only; Razorpay
  webhooks are the sole authoritative source of payment state.
- Recommendation quality and payment-path quality still require broader live
  integration evaluation (see Known Limitations).
- Local Kafka runs in plaintext while the application's Kafka client expects TLS;
  deferred because Kafka is observability-only in this project (see
  `backend/README.md`).

## Model & Migration Story

The project originally used a deprecated Groq model (`llama-3.1-8b-instant`), which
began returning `404 model_not_found`. This silently triggered the deterministic
fallback planner — meaning the agent appeared to work, but was no longer using the
LLM at all. The root cause was found by directly probing Groq's available models
list. The project was migrated to `openai/gpt-oss-20b`, and the error-handling was
also fixed so future provider failures surface explicitly instead of being masked
as a silent fallback (see Challenges #4).

## Agent Design

The agent has four stages: planner → validator → tool executor → response synthesis.

**Planner** — entry point for natural-language requests. Uses JSON-structured
output to decide intent and the next tool to call, restricted to a fixed set of
commerce actions.

**Tool constraints** — the agent can only call an allowlisted set of tools:

| Tool                               | Purpose                                    |
| ---------------------------------- | ------------------------------------------ |
| `search_products`                  | Catalog search                             |
| `get_product_details`              | Fetch details for a specific product       |
| `get_recommendations`              | Personalized product suggestions           |
| `compare_products`                 | Side-by-side comparison                    |
| `check_inventory`                  | Stock availability check                   |
| `add_to_cart` / `remove_from_cart` | Cart management                            |
| `wishlist_product`                 | Wishlist management                        |
| `prepare_order`                    | Checkout preparation (not payment capture) |

Every tool call is argument-validated before execution. Unknown tools, malformed
arguments, and repeated redundant calls are rejected.

**Memory & state** — per-session memory in Redis (previous filters, recent cart
activity, selected products), used to support multi-turn refinement without
exposing internal reasoning to the user.

**Action limits:**

| Limit                     | Value                                       |
| ------------------------- | ------------------------------------------- |
| Max agent steps           | 6                                           |
| Max LLM calls per session | 4                                           |
| Max same-tool repetition  | 2                                           |
| Total agent timeout       | 20 seconds                                  |
| Fallback                  | Deterministic planner if LLM is unavailable |

**Payment confirmation boundary** — the agent may prepare a checkout, but it never
claims payment success. Payment always requires explicit user confirmation through
the Razorpay flow, and success is only ever reported after backend webhook
confirmation (see `backend/README.md`).

## What This System Explicitly Does Not Include

- Retrieval-augmented generation (RAG)
- Embeddings or vector search
- Fine-tuning
- A separate knowledge base
- Autonomous payment capture by the AI

## Evaluation Methodology

All metrics below are reproducible from this repository. Commands assume you're in
`backend/` with dependencies installed and required env vars set (see
`backend/README.md` for setup).

### Deterministic evaluator (20 fixed test cases)

```bash
npm run evaluate-agent
```

Measures task completion, tool selection accuracy, constraint satisfaction,
malformed-tool handling, and invalid-action detection — without calling a live LLM.

| Metric                  | Result |
| ----------------------- | ------ |
| Task completion rate    | 85%    |
| Tool selection accuracy | 85%    |
| Constraint violations   | 0/3    |

### Live LLM agent journey

Runs a real query ("black wedding outfit under ₹10,000, size M") through the actual
Groq-backed agent, not the deterministic evaluator.

| Metric                    | Result                          |
| ------------------------- | ------------------------------- |
| LLM calls                 | 3                               |
| Latency                   | 2408 ms                         |
| Constraint satisfaction   | 100%                            |
| Hallucination rate        | 0.00%                           |
| Verified product returned | "Black Wedding Jacket" — ₹7,499 |

### Catalog validation

Checks agent-returned products against real catalog records across a broader query
set.

| Metric                  | Result |
| ----------------------- | ------ |
| Queries tested          | 29     |
| Products checked        | 9      |
| Hallucination rate      | 0.00%  |
| Constraint satisfaction | 88.89% |

### Groq latency benchmark (20 requests, standalone)

| Metric  | Result  |
| ------- | ------- |
| p50     | 537 ms  |
| p95     | 670 ms  |
| Average | 594 ms  |
| Max     | 1303 ms |

## Real Challenges & Fixes

### 1. Duplicate/conflicting Razorpay webhook verification

The webhook path originally verified signatures twice — once against the raw
request body using `RAZORPAY_WEBHOOK_SECRET`, and again against the already-parsed,
re-serialized body using `RAZORPAY_KEY_SECRET`. These are different credentials,
and re-serializing JSON can produce different bytes than what was originally
signed — meaning valid webhooks were likely to fail verification. **Fix:** removed
the redundant check; verification now happens exactly once, against the raw request
buffer, using the single correct secret.

### 2. Frontend declared success before backend confirmation

The UI showed a success screen as soon as Razorpay's browser-side callback fired —
before the backend had received or processed the webhook. This callback doesn't
guarantee the payment was captured, the webhook arrived, or inventory was updated.
**Fix:** the frontend now polls a backend payment-status endpoint and only shows
success once the backend confirms a `PAID` state.

### 3. Non-transactional, non-idempotent inventory deduction

Inventory was deducted per item without protection against duplicate webhook
delivery or partial failure mid-deduction, risking overselling or inconsistent
stock. **Fix:** inventory deduction now runs inside atomic PostgreSQL transactions,
combined with an explicit checkout state machine and idempotency tracking so
replayed webhooks don't double-deduct.

### 4. Deprecated Groq model caused a silent fallback

When the configured model started returning `404 model_not_found`, the code
silently fell back to the deterministic planner instead of surfacing the error —
meaning the "AI agent" was quietly no longer using an LLM at all. This was found by
directly probing Groq's model list to isolate the failure. **Fix:** migrated to
`openai/gpt-oss-20b`, and fixed error handling so provider failures are now logged
and surfaced explicitly instead of silently degrading.

### 5. Native ESM import path failures blocking startup

The backend failed to start due to missing `.js` extensions, incorrect relative
paths, and case-sensitive filename mismatches (e.g. `ApiError.js` vs
`api-error.js`) under Node's native ESM module resolution. **Fix:** ran the server
directly, traced each import failure in sequence, and corrected them one at a time,
re-verifying startup after each fix.

## Known Limitations

1. Local Kafka runs in plaintext while the application's Kafka client expects TLS.
   Deferred — Kafka is observability-only in this project, not business-critical.
2. Elasticsearch has a known `subCategory` mapping/query issue; MongoDB fallback
   keeps search functional in the meantime.
3. No live Razorpay production capture has been tested. Integration tests use real
   local databases (MongoDB, PostgreSQL, Redis, Kafka) with simulated, correctly
   signed webhook payloads — not payloads delivered by Razorpay's live servers.
4. Authenticated mutation completion and agent-attribution reconciliation are not
   yet measured by the live validator.
5. No automated frontend test suite exists yet.
