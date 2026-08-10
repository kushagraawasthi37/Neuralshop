import prisma from "../../prisma/client.js";
import { runAnalyticsTask } from "../../workers/analytics.worker.js";

// ============================================================
// QUERY HELPERS
// ============================================================

const getDateQuery = (startDate, endDate) => ({
  createdAt: {
    gte: new Date(startDate),
    lte: new Date(endDate),
  },
});

const getSellerItemFilter = (sellerId) => (sellerId ? { sellerId } : {});

const getSellerOrderFilter = (sellerId) =>
  sellerId
    ? {
        items: {
          some: {
            sellerId,
          },
        },
      }
    : {};

const getActiveItemFilter = ({
  sellerId = null,
  startDate = null,
  endDate = null,
} = {}) => ({
  ...getSellerItemFilter(sellerId),

  ...(startDate && endDate
    ? {
        createdAt: getDateQuery(startDate, endDate),
      }
    : {}),

  status: {
    not: "CANCELLED",
  },

  order: {
    status: {
      not: "CANCELLED",
    },
  },
});

const getItemFilter = ({
  sellerId = null,
  startDate = null,
  endDate = null,
} = {}) => ({
  ...getSellerItemFilter(sellerId),

  ...(startDate && endDate
    ? {
        createdAt: getDateQuery(startDate, endDate),
      }
    : {}),
});


const getItemRevenue = (item) => item.price * item.quantity;

const calculateRevenue = (items) =>
  items.reduce((total, item) => total + getItemRevenue(item), 0);

const getUniqueOrderCount = (items) =>
  new Set(items.map((item) => item.orderId)).size;

const aggregateByProduct = (items) => {
  const products = new Map();

  for (const item of items) {
    if (!products.has(item.productId)) {
      products.set(item.productId, {
        productId: item.productId,
        quantity: 0,
        revenue: 0,
        orders: new Set(),
      });
    }

    const product = products.get(item.productId);

    product.quantity += item.quantity;
    product.revenue += getItemRevenue(item);
    product.orders.add(item.orderId);
  }

  return Array.from(products.values()).map((product) => ({
    productId: product.productId,
    quantity: product.quantity,
    revenue: product.revenue,
    orders: product.orders.size,
  }));
};

const aggregateByStatus = (items) => {
  const statuses = new Map();

  for (const item of items) {
    if (!statuses.has(item.status)) {
      statuses.set(item.status, {
        status: item.status,
        revenue: 0,
        quantity: 0,
        count: 0,
      });
    }

    const status = statuses.get(item.status);

    status.revenue += getItemRevenue(item);
    status.quantity += item.quantity;
    status.count += 1;
  }

  return Array.from(statuses.values());
};

const aggregateDailySales = (items) => {
  const dailySales = new Map();

  for (const item of items) {
    const date = item.createdAt.toISOString().split("T")[0];

    if (!dailySales.has(date)) {
      dailySales.set(date, {
        date,
        revenue: 0,
        quantity: 0,
        orders: new Set(),
      });
    }

    const daily = dailySales.get(date);

    daily.revenue += getItemRevenue(item);
    daily.quantity += item.quantity;
    daily.orders.add(item.orderId);
  }

  return Array.from(dailySales.values())
    .map((day) => ({
      date: day.date,
      revenue: day.revenue,
      quantity: day.quantity,
      orders: day.orders.size,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// ============================================================
// DASHBOARD STATS
// ============================================================

export const getDashboardStatsService = async (sellerId = null) => {
  const sellerOrderFilter = getSellerOrderFilter(sellerId);

  const sellerItemFilter = getSellerItemFilter(sellerId);

  const [
    totalOrders,
    revenueItems,
    nonCancelledOrders,
    uniqueCustomers,
    pendingOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: sellerOrderFilter,
    }),

    prisma.orderItem.findMany({
      where: getActiveItemFilter({
        sellerId,
      }),
      select: {
        price: true,
        quantity: true,
      },
    }),

    prisma.order.count({
      where: {
        ...sellerOrderFilter,
        status: {
          not: "CANCELLED",
        },
      },
    }),

    prisma.order.groupBy({
      by: ["userId"],
      where: sellerOrderFilter,
    }),

    prisma.order.count({
      where: {
        status: "PENDING",
        ...sellerOrderFilter,
      },
    }),
  ]);

  const totalRevenue = calculateRevenue(revenueItems);

  const totalCustomers = uniqueCustomers.length;

  const avgOrderValue =
    nonCancelledOrders > 0 ? totalRevenue / nonCancelledOrders : 0;

  return {
    totalOrders,
    totalRevenue,
    totalCustomers,
    pendingOrders,
    avgOrderValue,
  };
};

// ============================================================
// SALES ANALYTICS
// ============================================================

export const getSalesAnalyticsService = async (
  startDate,
  endDate,
  sellerId = null,
) => {
  const salesItems = await prisma.orderItem.findMany({
    where: getActiveItemFilter({
      sellerId,
      startDate,
      endDate,
    }),

    select: {
      orderId: true,
      productId: true,
      price: true,
      quantity: true,
      status: true,
      createdAt: true,
    },
  });

  const dailySales = aggregateDailySales(salesItems);

  const topProducts = aggregateByProduct(salesItems)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const statusItems = await prisma.orderItem.findMany({
    where: getItemFilter({
      sellerId,
      startDate,
      endDate,
    }),

    select: {
      status: true,
      price: true,
      quantity: true,
    },
  });

  const revenueByStatus = aggregateByStatus(statusItems);

  const aggregatedDailySales = await runAnalyticsTask("dailySales", {
    dailySales,
  });

  return {
    dailySales: aggregatedDailySales,
    topProducts,
    revenueByStatus,
  };
};

// ============================================================
// PAYMENT ANALYTICS
// ============================================================

export const getPaymentAnalyticsService = async (startDate, endDate) => {
  const dateQuery = getDateQuery(startDate, endDate);

  const [paymentStatus, paymentProvider, failedPayments, refundedAmount] =
    await Promise.all([
      prisma.payment.groupBy({
        by: ["status"],
        _count: true,
        _sum: {
          amount: true,
        },
        where: dateQuery,
      }),

      prisma.payment.groupBy({
        by: ["provider"],
        _count: true,
        _sum: {
          amount: true,
        },
        where: dateQuery,
      }),

      prisma.payment.count({
        where: {
          status: "failed",
          ...dateQuery,
        },
      }),

      prisma.payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "refunded",
          ...dateQuery,
        },
      }),
    ]);

  return {
    paymentStatus,
    paymentProvider,
    failedPayments,
    refundedAmount: refundedAmount._sum.amount || 0,
  };
};

// ============================================================
// CUSTOMER ANALYTICS
// ============================================================

export const getCustomerAnalyticsService = async (
  startDate,
  endDate,
  sellerId = null,
) => {
  const dateQuery = getDateQuery(startDate, endDate);

  const sellerOrderFilter = getSellerOrderFilter(sellerId);

  const [newCustomers, allCustomers, customerItems] = await Promise.all([
    prisma.order.groupBy({
      by: ["userId"],
      where: {
        ...dateQuery,
        ...sellerOrderFilter,
      },
    }),

    prisma.order.groupBy({
      by: ["userId"],
      _count: true,
      where: sellerOrderFilter,
    }),

    prisma.orderItem.findMany({
      where: getActiveItemFilter({
        sellerId,
        startDate,
        endDate,
      }),

      select: {
        orderId: true,
        price: true,
        quantity: true,
        order: {
          select: {
            userId: true,
          },
        },
      },
    }),
  ]);

  const customers = new Map();

  for (const item of customerItems) {
    const userId = item.order.userId;

    if (!customers.has(userId)) {
      customers.set(userId, {
        userId,
        revenue: 0,
        orders: new Set(),
      });
    }

    const customer = customers.get(userId);
    customer.revenue += getItemRevenue(item);
    customer.orders.add(item.orderId);
  }

  const customerValue = Array.from(customers.values()).map((customer) => ({
    userId: customer.userId,
    _avg: {
      totalAmount:
        customer.orders.size > 0 ? customer.revenue / customer.orders.size : 0,
    },
    _count: customer.orders.size,
    revenue: customer.revenue,
  }));

  const topCustomers = customerValue
    .map((customer) => ({
      userId: customer.userId,
      totalRevenue: customer.revenue,
      orderCount: customer._count,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const { repeatCustomers, avgCustomerValue } = await runAnalyticsTask(
    "customerAnalytics",
    {
      allCustomers,
      customerValue,
    },
  );

  return {
    newCustomers: newCustomers.length,
    repeatCustomers,
    avgCustomerValue,
    topCustomers,
  };
};

// ============================================================
// INVENTORY ANALYTICS
// ============================================================

export const getInventoryAnalyticsService = async (adminId = null) => {
  const ownerFilter = adminId ? { adminId } : {};

  const [lowStock, totalProducts, stockSummary, mostReserved] =
    await Promise.all([
      prisma.inventory.findMany({
        where: {
          ...ownerFilter,
          totalStock: {
            gt: 0,
          },
        },
        select: {
          id: true,
          adminId: true,
          productId: true,
          size: true,
          totalStock: true,
          reservedStock: true,
        },
      }),

      prisma.inventory.groupBy({
        by: ["productId"],
        where: ownerFilter,
      }),

      prisma.inventory.aggregate({
        where: ownerFilter,
        _sum: {
          totalStock: true,
          reservedStock: true,
        },
      }),

      prisma.inventory.findMany({
        where: ownerFilter,
        orderBy: {
          reservedStock: "desc",
        },
        take: 10,
        select: {
          id: true,
          adminId: true,
          productId: true,
          size: true,
          totalStock: true,
          reservedStock: true,
        },
      }),
    ]);

  const lowStockItems = lowStock.filter(
    (item) => item.totalStock - item.reservedStock <= 10,
  );

  const totalStock = stockSummary._sum.totalStock || 0;

  const reservedStock = stockSummary._sum.reservedStock || 0;

  return {
    lowStockItems: lowStockItems.length,
    totalProducts: totalProducts.length,
    totalStock,
    reservedStock,
    availableStock: totalStock - reservedStock,
    mostReserved,
  };
};

// ============================================================
// ORDER STATUS DISTRIBUTION
// ============================================================

export const getOrderStatusDistributionService = async (
  startDate,
  endDate,
  sellerId = null,
) => {
  const distribution = await prisma.orderItem.groupBy({
    by: ["status"],
    _count: true,

    where: getItemFilter({
      sellerId,
      startDate,
      endDate,
    }),
  });

  return distribution;
};

// ============================================================
// COUPON ANALYTICS
// ============================================================

export const getCouponAnalyticsService = async (startDate, endDate) => {
  const dateQuery = getDateQuery(startDate, endDate);

  const [topCoupons, totalDiscount] = await Promise.all([
    prisma.orderDiscount.groupBy({
      by: ["couponId"],
      _count: true,
      _sum: {
        discountAmount: true,
      },
      where: dateQuery,
      orderBy: {
        _count: "desc",
      },
      take: 10,
    }),

    prisma.orderDiscount.aggregate({
      _sum: {
        discountAmount: true,
      },
      where: dateQuery,
    }),
  ]);

  return {
    topCoupons,
    totalDiscountGiven: totalDiscount._sum.discountAmount || 0,
  };
};

// ============================================================
// SELLER ANALYTICS
// ============================================================

export const getSellerAnalyticsService = async (
  sellerId,
  startDate,
  endDate,
) => {
  const sellerItems = await prisma.orderItem.findMany({
    where: getActiveItemFilter({
      sellerId,
      startDate,
      endDate,
    }),

    select: {
      orderId: true,
      productId: true,
      price: true,
      quantity: true,
      status: true,
    },
  });

  const totalOrders = getUniqueOrderCount(sellerItems);

  const totalRevenue = calculateRevenue(sellerItems);

  const statusBreakdown = await prisma.orderItem.groupBy({
    by: ["status"],
    _count: true,

    where: getItemFilter({
      sellerId,
      startDate,
      endDate,
    }),
  });

  const topProducts = aggregateByProduct(sellerItems)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return {
    totalOrders,
    totalRevenue,
    statusBreakdown,
    topProducts,
  };
};
