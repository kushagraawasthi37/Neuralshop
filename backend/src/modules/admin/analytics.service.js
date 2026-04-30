import prisma from "../../prisma/client.js";

// ============================================
// DASHBOARD OVERVIEW STATS
// ============================================
export const getDashboardStatsService = async (sellerId = null) => {
  try {
    // Total Orders
    const ordersQuery = sellerId ? { items: { some: { sellerId } } } : {};
    const totalOrders = await prisma.order.count({
      where: ordersQuery,
    });

    // Total Revenue (exclude cancelled orders)
    const revenueQuery = sellerId
      ? { items: { some: { sellerId } }, status: { not: "CANCELLED" } }
      : { status: { not: "CANCELLED" } };
    const revenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: revenueQuery,
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Non-cancelled order count for avg calculation
    const nonCancelledCount = await prisma.order.count({ where: revenueQuery });

    // Total Customers (unique)
    const customersQuery = sellerId ? { items: { some: { sellerId } } } : {};
    const uniqueCustomers = await prisma.order.groupBy({
      by: ["userId"],
      where: customersQuery,
    });
    const totalCustomers = uniqueCustomers.length;

    // Pending Orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
        ...ordersQuery,
      },
    });

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
      avgOrderValue: nonCancelledCount > 0 ? totalRevenue / nonCancelledCount : 0,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// SALES ANALYTICS
// ============================================
export const getSalesAnalyticsService = async (
  startDate,
  endDate,
  sellerId = null,
) => {
  try {
    const dateQuery = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const itemsQuery = sellerId ? { sellerId } : {};

    // Daily sales
    const dailySales = await prisma.orderItem.groupBy({
      by: ["createdAt"],
      _sum: { price: true },
      _count: true,
      where: {
        order: { ...dateQuery },
        ...itemsQuery,
      },
    });

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      _count: true,
      where: {
        order: { ...dateQuery },
        ...itemsQuery,
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    // Revenue by status
    const revenueByStatus = await prisma.orderItem.groupBy({
      by: ["status"],
      _sum: { price: true },
      _count: true,
      where: {
        order: { ...dateQuery },
        ...itemsQuery,
      },
    });

    // Aggregate raw groupBy results into per-day buckets (Prisma groups by exact timestamp)
    const dailyMap = {};
    for (const d of dailySales) {
      const dateKey = new Date(d.createdAt).toISOString().split("T")[0];
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      dailyMap[dateKey].revenue += d._sum?.price || 0;
      const cnt = typeof d._count === "number" ? d._count : (d._count?._all || 0);
      dailyMap[dateKey].orders += cnt;
    }
    const aggregatedDailySales = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      dailySales: aggregatedDailySales,
      topProducts,
      revenueByStatus,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// PAYMENT ANALYTICS
// ============================================
export const getPaymentAnalyticsService = async (startDate, endDate) => {
  try {
    const dateQuery = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Payment status breakdown
    const paymentStatus = await prisma.payment.groupBy({
      by: ["status"],
      _count: true,
      _sum: { amount: true },
      where: dateQuery,
    });

    // Payment provider breakdown
    const paymentProvider = await prisma.payment.groupBy({
      by: ["provider"],
      _count: true,
      _sum: { amount: true },
      where: dateQuery,
    });

    // Failed payments
    const failedPayments = await prisma.payment.count({
      where: {
        status: "failed",
        ...dateQuery,
      },
    });

    // Refunded payments
    const refundedAmount = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "refunded",
        ...dateQuery,
      },
    });

    return {
      paymentStatus,
      paymentProvider,
      failedPayments,
      refundedAmount: refundedAmount._sum.amount || 0,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// CUSTOMER ANALYTICS
// ============================================
export const getCustomerAnalyticsService = async (startDate, endDate) => {
  try {
    const dateQuery = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // New customers
    const newCustomers = await prisma.order.groupBy({
      by: ["userId"],
      where: dateQuery,
    });

    // Repeat customers (customers with 2+ orders)
    const allCustomers = await prisma.order.groupBy({
      by: ["userId"],
      _count: true,
    });

    const repeatCustomers = allCustomers.filter((c) => c._count >= 2).length;

    // Average order value by customer
    const customerValue = await prisma.order.groupBy({
      by: ["userId"],
      _avg: { totalAmount: true },
      _count: true,
      where: dateQuery,
    });

    // Top customers by spending
    const topCustomers = await prisma.order.groupBy({
      by: ["userId"],
      _sum: { totalAmount: true },
      _count: true,
      where: dateQuery,
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 10,
    });

    return {
      newCustomers: newCustomers.length,
      repeatCustomers,
      avgCustomerValue:
        customerValue.length > 0
          ? customerValue.reduce(
              (sum, c) => sum + (c._avg.totalAmount || 0),
              0,
            ) / customerValue.length
          : 0,
      topCustomers,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// INVENTORY ANALYTICS
// ============================================
export const getInventoryAnalyticsService = async (sellerId = null) => {
  try {
    // Low stock items
    const lowStock = await prisma.inventory.findMany({
      where: {
        totalStock: { lte: 10 },
      },
    });

    // Total products
    const totalProducts = await prisma.inventory.groupBy({
      by: ["productId"],
    });

    // Stock value (approximation using avg price)
    const inventoryValue = await prisma.inventory.aggregate({
      _sum: { totalStock: true },
    });

    // Most reserved items
    const mostReserved = await prisma.inventory.findMany({
      orderBy: { reservedStock: "desc" },
      take: 10,
    });

    return {
      lowStockItems: lowStock.length,
      totalProducts: totalProducts.length,
      totalStock: inventoryValue._sum.totalStock || 0,
      mostReserved,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// ORDER STATUS DISTRIBUTION
// ============================================
export const getOrderStatusDistributionService = async (
  startDate,
  endDate,
  sellerId = null,
) => {
  try {
    const dateQuery = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    const itemsQuery = sellerId ? { sellerId } : {};

    const distribution = await prisma.orderItem.groupBy({
      by: ["status"],
      _count: true,
      where: {
        order: { ...dateQuery },
        ...itemsQuery,
      },
    });

    return distribution;
  } catch (error) {
    throw error;
  }
};

// ============================================
// COUPON USAGE ANALYTICS
// ============================================
export const getCouponAnalyticsService = async (startDate, endDate) => {
  try {
    const dateQuery = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Most used coupons
    const topCoupons = await prisma.orderDiscount.groupBy({
      by: ["couponId"],
      _count: true,
      _sum: { discountAmount: true },
      where: dateQuery,
      orderBy: { _count: "desc" },
      take: 10,
    });

    // Total discount given
    const totalDiscount = await prisma.orderDiscount.aggregate({
      _sum: { discountAmount: true },
      where: dateQuery,
    });

    return {
      topCoupons,
      totalDiscountGiven: totalDiscount._sum.discountAmount || 0,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// SELLER ANALYTICS
// ============================================
export const getSellerAnalyticsService = async (
  sellerId,
  startDate,
  endDate,
) => {
  try {
    const dateQuery = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Seller's orders
    const orders = await prisma.orderItem.findMany({
      where: {
        sellerId,
        order: { ...dateQuery },
      },
      include: { order: true },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + o.price * o.quantity,
      0,
    );

    // Order status breakdown
    const statusBreakdown = await prisma.orderItem.groupBy({
      by: ["status"],
      _count: true,
      where: {
        sellerId,
        order: { ...dateQuery },
      },
    });

    // Top products sold
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: true,
      where: {
        sellerId,
        order: { ...dateQuery },
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    return {
      totalOrders,
      totalRevenue,
      statusBreakdown,
      topProducts,
    };
  } catch (error) {
    throw error;
  }
};
