const transitions = {
  CREATED: new Set(["RESERVED", "FAILED", "CANCELLED"]),
  RESERVED: new Set(["PAYMENT_PENDING", "FAILED", "CANCELLED"]),
  PAYMENT_PENDING: new Set(["PAID", "FAILED", "CANCELLED"]),
  PAID: new Set(["FULFILLED"]),
  FULFILLED: new Set(),
  FAILED: new Set(),
  CANCELLED: new Set(),
};

export const checkoutStates = new Set(Object.keys(transitions));

export const transitionCheckoutState = (current, next) => {
  if (!checkoutStates.has(current) || !transitions[current].has(next)) {
    throw new Error(`Invalid checkout state transition: ${current} -> ${next}`);
  }
  return next;
};