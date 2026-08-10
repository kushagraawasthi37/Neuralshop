import { logger } from "./logger.js";

// ─── CircuitBreaker ────────────────────────────────────────────────────────
// Prevents cascade failures. If Elasticsearch is down and we keep hitting it,
// each request waits for a timeout (e.g. 5s) before falling back — that's
// 5s of blocked event loop time per request. A circuit breaker detects the
// failure pattern and short-circuits to the fallback IMMEDIATELY.


// States:
//   CLOSED  → normal operation (calls go through)
//   OPEN    → service is down; calls go directly to fallback
//   HALF_OPEN → test period: one probe allowed to check if service recovered

// Usage in product search controller:
//   const cb = new CircuitBreaker({ name: "elasticsearch", threshold: 5, resetMs: 30000 });
//   const results = await cb.fire(
//     () => elasticsearchService.search(query),  // primary
//     () => mongodbService.search(query),         // fallback
//   );

const STATE = { CLOSED: "CLOSED", OPEN: "OPEN", HALF_OPEN: "HALF_OPEN" };

export class CircuitBreaker {
  constructor({ name, threshold = 5, resetMs = 30_000 } = {}) {
    this.name = name ?? "unnamed";
    this.threshold = threshold;   // consecutive failures before opening
    this.resetMs = resetMs;       // ms before attempting HALF_OPEN probe
    this._state = STATE.CLOSED;
    this._failures = 0;
    this._nextAttempt = 0;
  }

  get state() {
    return this._state;
  }

  async fire(primaryFn, fallbackFn) {
    if (this._state === STATE.OPEN) {
      if (Date.now() >= this._nextAttempt) {
        this._state = STATE.HALF_OPEN;
        logger.info(`CircuitBreaker [${this.name}]: HALF_OPEN — probing service`);
      } else {
        logger.debug(`CircuitBreaker [${this.name}]: OPEN — using fallback`);
        return fallbackFn();
      }
    }

    try {
      const result = await primaryFn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure(err);
      if (fallbackFn) {
        logger.warn(`CircuitBreaker [${this.name}]: primary failed — using fallback`, {
          error: err.message, failures: this._failures,
        });
        return fallbackFn();
      }
      throw err;
    }
  }

  _onSuccess() {
    if (this._state === STATE.HALF_OPEN) {
      logger.info(`CircuitBreaker [${this.name}]: CLOSED — service recovered`);
    }
    this._failures = 0;
    this._state = STATE.CLOSED;
  }

  _onFailure(err) {
    this._failures++;

    if (this._state === STATE.HALF_OPEN || this._failures >= this.threshold) {
      this._state = STATE.OPEN;
      this._nextAttempt = Date.now() + this.resetMs;
      logger.error(`CircuitBreaker [${this.name}]: OPEN after ${this._failures} failure(s) — next probe in ${this.resetMs / 1000}s`, {
        error: err.message, category: "circuit-breaker",
      });
    }
  }

  // Health info for the /healthCheck endpoint
  toJSON() {
    return {
      name: this.name,
      state: this._state,
      failures: this._failures,
      nextAttemptAt: this._state === STATE.OPEN ? new Date(this._nextAttempt).toISOString() : null,
    };
  }
}

// ─── Singleton circuit breakers ───────────────────────────────────────────
// Import these in controllers instead of creating new instances per-request.
// Creating per-request breaks the state machine (failures never accumulate).
export const elasticsearchCircuitBreaker = new CircuitBreaker({
  name: "elasticsearch",
  threshold: 5,
  resetMs: 30_000,
});

export default CircuitBreaker;
