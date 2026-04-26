import prisma from "../../prisma/client.js";

// ============================================
// USER: REQUEST RETURN
// ============================================
export const requestReturnService = async (
  orderItemId,
  userId,
  { reason, description },
) => {
  try {
    // Verify order belongs to user
    // (This requires a join - adjust based on your schema)
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderItemId,
        userId,
        reason,
        description,
        status: "REQUESTED",
      },
    });

    return returnRequest;
  } catch (error) {
    throw error;
  }
};

// ============================================
// USER: GET USER'S RETURN REQUESTS
// ============================================
export const getUserReturnsService = async (userId) => {
  try {
    const returns = await prisma.returnRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return returns;
  } catch (error) {
    throw error;
  }
};

// ============================================
// USER: GET SPECIFIC RETURN REQUEST
// ============================================
export const getReturnRequestService = async (returnId, userId) => {
  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      throw new Error("Return request not found");
    }

    if (returnRequest.userId !== userId) {
      throw new Error("Unauthorized: This is not your return request");
    }

    return returnRequest;
  } catch (error) {
    throw error;
  }
};

// ============================================
// USER: CANCEL RETURN REQUEST
// ============================================
export const cancelReturnService = async (returnId, userId) => {
  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      throw new Error("Return request not found");
    }

    if (returnRequest.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (returnRequest.status !== "REQUESTED") {
      throw new Error("Can only cancel requests that are in REQUESTED status");
    }

    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: { status: "REJECTED" },
    });

    return updatedReturn;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: GET ALL RETURN REQUESTS
// ============================================
export const getAllReturnRequestsService = async ({
  skip = 0,
  limit = 20,
  status,
} = {}) => {
  try {
    const where = status ? { status } : {};

    const returns = await prisma.returnRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.returnRequest.count({ where });

    return {
      returns,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: APPROVE RETURN REQUEST
// ============================================
export const approveReturnService = async (returnId, refundAmount) => {
  try {
    const returnRequest = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "APPROVED",
        refundAmount,
      },
    });

    return returnRequest;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: REJECT RETURN REQUEST
// ============================================
export const rejectReturnService = async (returnId) => {
  try {
    const returnRequest = await prisma.returnRequest.update({
      where: { id: returnId },
      data: { status: "REJECTED" },
    });

    return returnRequest;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: PROCESS REFUND
// ============================================
export const processRefundService = async (returnId) => {
  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
    });

    if (!returnRequest) {
      throw new Error("Return request not found");
    }

    if (returnRequest.status !== "APPROVED") {
      throw new Error("Can only process refunds for APPROVED returns");
    }

    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "REFUNDED",
        refundStatus: "PROCESSED",
      },
    });

    return updatedReturn;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: MARK REFUND AS FAILED
// ============================================
export const markRefundFailedService = async (returnId) => {
  try {
    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: { refundStatus: "FAILED" },
    });

    return updatedReturn;
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET RETURN STATISTICS (ADMIN ANALYTICS)
// ============================================
export const getReturnStatsService = async () => {
  try {
    const stats = await prisma.returnRequest.groupBy({
      by: ["status"],
      _count: true,
    });

    const totalRefunded = await prisma.returnRequest.aggregate({
      where: { status: "REFUNDED" },
      _sum: { refundAmount: true },
    });

    return {
      byStatus: stats,
      totalRefunded: totalRefunded._sum.refundAmount || 0,
    };
  } catch (error) {
    throw error;
  }
};
