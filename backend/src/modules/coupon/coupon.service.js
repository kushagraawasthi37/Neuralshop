import prisma from "../../prisma/client.js";

// ============================================
// ADMIN: CREATE COUPON
// ============================================
export const createCouponService = async ({
  code,
  discountType,
  discountValue,
  minOrderAmount,
  maxUses,
  maxUsesPerUser,
  startDate,
  expiryDate,
}) => {
  try {
    // Check if coupon already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      throw new Error("Coupon code already exists");
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || null,
        maxUses: maxUses || null,
        maxUsesPerUser: maxUsesPerUser || 1,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        isActive: true,
      },
    });

    return coupon;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: GET ALL COUPONS
// ============================================
export const getAllCouponsService = async ({ skip = 0, limit = 20 } = {}) => {
  try {
    const coupons = await prisma.coupon.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orderDiscounts: true },
        },
      },
    });

    const total = await prisma.coupon.count();

    return {
      coupons,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// GET ACTIVE COUPON BY CODE (USER)
// ============================================
export const getCouponByCodeService = async (code) => {
  try {
    const now = new Date();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Check if coupon is active and not expired
    if (!coupon.isActive || coupon.startDate > now || coupon.expiryDate < now) {
      throw new Error("Coupon is not valid or has expired");
    }

    // Check if max uses reached
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error("Coupon usage limit reached");
    }

    return coupon;
  } catch (error) {
    throw error;
  }
};

// ============================================
// VALIDATE COUPON FOR ORDER
// ============================================
export const validateCouponService = async (
  couponCode,
  orderAmount,
  userId,
) => {
  try {
    const coupon = await getCouponByCodeService(couponCode);

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw new Error(
        `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      );
    }

    // Check user's coupon usage
    const userUsage = await prisma.orderDiscount.count({
      where: {
        coupon: {
          code: couponCode,
        },
      },
    });

    if (userUsage >= coupon.maxUsesPerUser) {
      throw new Error("You have already used this coupon");
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
    }

    return {
      coupon,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// APPLY COUPON TO ORDER
// ============================================
export const applyCouponToOrderService = async (orderId, couponCode) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (order.totalAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
    }

    // Create order discount record
    const orderDiscount = await prisma.orderDiscount.create({
      data: {
        orderId,
        couponId: coupon.id,
        discountAmount,
      },
    });

    // Increment coupon usage
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });

    return {
      orderId,
      couponCode,
      discountAmount,
      newTotal: order.totalAmount - discountAmount,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: UPDATE COUPON
// ============================================
export const updateCouponService = async (couponId, updateData) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...updateData,
        startDate: updateData.startDate
          ? new Date(updateData.startDate)
          : undefined,
        expiryDate: updateData.expiryDate
          ? new Date(updateData.expiryDate)
          : undefined,
      },
    });

    return coupon;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: DELETE COUPON
// ============================================
export const deleteCouponService = async (couponId) => {
  try {
    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return { message: "Coupon deleted successfully" };
  } catch (error) {
    throw error;
  }
};

// ============================================
// ADMIN: TOGGLE COUPON ACTIVE STATUS
// ============================================
export const toggleCouponStatusService = async (couponId, isActive) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive },
    });

    return coupon;
  } catch (error) {
    throw error;
  }
};
