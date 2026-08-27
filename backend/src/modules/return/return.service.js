import prisma from "../../prisma/client.js";
import { ApiError } from "../../utils/ApiError.js";

const RETURN_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
  "COMPLETED",
];

const ACTIVE_RETURN_STATUSES = ["REQUESTED", "APPROVED"];

const getAdminFilter = (adminId) =>
  adminId
    ? {
        orderItem: {
          sellerId: adminId,
        },
      }
    : {};

const getReturnInclude = () => ({
  orderItem: true,
});

const validateReturnStatus = (status) => {
  if (!RETURN_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Invalid return status. Must be one of: ${RETURN_STATUSES.join(", ")}`,
      [],
      "return",
    );
  }
};

const validateDeliveredItem = (orderItem) => {
  if (!orderItem) {
    throw new ApiError(
      404,
      "Order item not found or does not belong to user",
      [],
      "return",
    );
  }

  if (orderItem.status !== "DELIVERED") {
    throw new ApiError(
      400,
      "Return can only be requested for a delivered item",
      [],
      "return",
    );
  }
};


const getReturnForAdmin = async (returnId, adminId) => {
  const returnRequest = await prisma.returnRequest.findFirst({
    where: {
      id: returnId,
      ...getAdminFilter(adminId),
    },
    include: getReturnInclude(),
  });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found", [], "return");
  }

  return returnRequest;
};

const getReturnForUser = async (returnId, userId) => {
  const returnRequest = await prisma.returnRequest.findFirst({
    where: {
      id: returnId,
      userId,
    },
    include: getReturnInclude(),
  });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found", [], "return");
  }

  return returnRequest;
};



// ============================================================
// USER: REQUEST RETURN
// ============================================================

export const requestReturnService = async (
  orderItemId,
  userId,
  { reason, description },
) => {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: {
        userId,
      },
    },
  });

  validateDeliveredItem(orderItem);

  const existingRequest = await prisma.returnRequest.findFirst({
    where: {
      orderItemId,
      userId,
      status: {
        in: ACTIVE_RETURN_STATUSES,
      },
    },
  });

  if (existingRequest) {
    throw new ApiError(
      409,
      "A return request already exists for this item",
      [],
      "return",
    );
  }

  return prisma.returnRequest.create({
    data: {
      orderItemId,
      userId,
      reason,
      description,
      status: "REQUESTED",
      refundStatus: "PENDING",
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// USER: GET USER ALL RETURNS
// ============================================================

export const getUserReturnsService = async (userId) => {
  return prisma.returnRequest.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// USER: GET SPECIFIC RETURN
// ============================================================

export const getReturnRequestService = async (returnId, userId) => {
  return getReturnForUser(returnId, userId);
};

// ============================================================
// USER: CANCEL RETURN
// ============================================================

export const cancelReturnService = async (returnId, userId) => {
  const returnRequest = await getReturnForUser(returnId, userId);

  if (returnRequest.status !== "REQUESTED") {
    throw new ApiError(
      400,
      "Only REQUESTED return requests can be cancelled",
      [],
      "return",
    );
  }

  return prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "REJECTED",
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// ADMIN: GET RETURN REQUESTS
// ============================================================

export const getAllReturnRequestsService = async ({
  adminId,
  skip = 0,
  limit = 20,
  status,
} = {}) => {
  if (status) {
    validateReturnStatus(status);
  }

  const where = {
    ...getAdminFilter(adminId),
    ...(status
      ? {
          status,
        }
      : {}),
  };

  const [returns, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      skip: Number(skip),
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: getReturnInclude(),
    }),

    prisma.returnRequest.count({
      where,
    }),
  ]);

  return {
    returns,
    total,
    pages: Number(limit) > 0 ? Math.ceil(total / Number(limit)) : 0,
  };
};

// ============================================================
// ADMIN: APPROVE RETURN
// ============================================================

export const approveReturnService = async (returnId, adminId, refundAmount) => {
  const returnRequest = await getReturnForAdmin(returnId, adminId);

  if (returnRequest.status !== "REQUESTED") {
    throw new ApiError(
      400,
      "Only REQUESTED returns can be approved",
      [],
      "return",
    );
  }

  const maximumRefund =
    returnRequest.orderItem.price * returnRequest.orderItem.quantity;

  const targetRefund =
    refundAmount !== undefined && refundAmount !== null && Number(refundAmount) > 0
      ? Number(refundAmount)
      : maximumRefund;

  if (targetRefund > maximumRefund) {
    throw new ApiError(
      400,
      "Refund amount cannot exceed the order item value",
      [],
      "return",
    );
  }

  return prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "APPROVED",
      refundAmount: targetRefund,
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// ADMIN: REJECT RETURN
// ============================================================

export const rejectReturnService = async (returnId, adminId) => {
  const returnRequest = await getReturnForAdmin(returnId, adminId);

  if (returnRequest.status !== "REQUESTED") {
    throw new ApiError(
      400,
      "Only REQUESTED returns can be rejected",
      [],
      "return",
    );
  }

  return prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "REJECTED",
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// ADMIN: PROCESS REFUND
// ============================================================

export const processRefundService = async (returnId, adminId) => {
  const returnRequest = await getReturnForAdmin(returnId, adminId);

  if (returnRequest.status !== "APPROVED") {
    throw new ApiError(
      400,
      "Only APPROVED returns can be refunded",
      [],
      "return",
    );
  }

  if (
    returnRequest.refundAmount === null ||
    returnRequest.refundAmount === undefined
  ) {
    throw new ApiError(400, "Refund amount is not set", [], "return");
  }

  return prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      status: "REFUNDED",
      refundStatus: "PROCESSED",
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// ADMIN: MARK REFUND FAILED
// ============================================================

export const markRefundFailedService = async (returnId, adminId) => {
  const returnRequest = await getReturnForAdmin(returnId, adminId);

  if (
    returnRequest.status !== "APPROVED" &&
    returnRequest.status !== "REFUNDED"
  ) {
    throw new ApiError(
      400,
      "Refund cannot be marked as failed in the current state",
      [],
      "return",
    );
  }

  return prisma.returnRequest.update({
    where: {
      id: returnId,
    },
    data: {
      refundStatus: "FAILED",

      // If refund processing failed after APPROVED,
      // keep the return itself APPROVED.
      ...(returnRequest.status === "REFUNDED"
        ? {
            status: "APPROVED",
          }
        : {}),
    },
    include: getReturnInclude(),
  });
};

// ============================================================
// ADMIN: RETURN STATISTICS
// ============================================================

export const getReturnStatsService = async (adminId) => {
  const adminFilter = getAdminFilter(adminId);

  const [byStatus, totalRefunded, pendingRequests, processedRefunds] =
    await Promise.all([
      prisma.returnRequest.groupBy({
        by: ["status"],
        _count: true,
        where: adminFilter,
      }),

      prisma.returnRequest.aggregate({
        where: {
          ...adminFilter,
          status: "REFUNDED",
        },
        _sum: {
          refundAmount: true,
        },
      }),

      prisma.returnRequest.count({
        where: {
          ...adminFilter,
          status: "REQUESTED",
        },
      }),

      prisma.returnRequest.count({
        where: {
          ...adminFilter,
          refundStatus: "PROCESSED",
        },
      }),
    ]);

  return {
    byStatus,
    totalRefunded: totalRefunded._sum.refundAmount || 0,
    pendingRequests,
    processedRefunds,
  };
};
