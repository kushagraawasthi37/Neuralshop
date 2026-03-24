// Idempotency utilities for preventing duplicate requests
const idempotencyMap = new Map();

export const checkIdempotency = (req, res, next) => {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return next();
  }

  if (idempotencyMap.has(idempotencyKey)) {
    const cachedResponse = idempotencyMap.get(idempotencyKey);
    return res.status(cachedResponse.statusCode).json(cachedResponse.data);
  }

  // Store original send method
  const originalSend = res.send;
  res.send = function (data) {
    idempotencyMap.set(idempotencyKey, {
      statusCode: res.statusCode,
      data: JSON.parse(data),
    });

    // Clean up after 24 hours
    setTimeout(
      () => idempotencyMap.delete(idempotencyKey),
      24 * 60 * 60 * 1000,
    );

    return originalSend.call(this, data);
  };

  next();
};

export default checkIdempotency;
