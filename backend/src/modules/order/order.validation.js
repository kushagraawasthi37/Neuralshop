import { ApiError } from "../../utils/api-error.js";

// ============================================
// ORDER VALIDATIONS
// ============================================

export const validateOrderCreation = (data) => {
  const { address } = data;

  if (!address) {
    throw new ApiError(400, "Address is required", [], "order");
  }

  if (typeof address !== "object") {
    throw new ApiError(400, "Address must be an object", [], "order");
  }
};

// ============================================
// ORDER ITEM STATUS UPDATE VALIDATION
// ============================================

export const validateOrderItemStatusUpdate = (data) => {
  const { status } = data;

  if (!status) {
    throw new ApiError(400, "Status is required", [], "order");
  }

  const validStatuses = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status.toUpperCase())) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      [],
      "order",
    );
  }
};
