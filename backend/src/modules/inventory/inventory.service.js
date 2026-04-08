import prisma from "../../prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { produceInventoryEvent } from "../../events/producers/inventory.producer.js";
import { inventoryEvents } from "../../events/event-types.js";

/**
 * 🔒 Reserve stock atomically using row-level locking
 * Prevents overselling by locking the inventory row
 */
export const reserveStockService = async (productId, quantity) => {
  const result = await prisma.$transaction(async (tx) => {
    // 🔒 Row-level lock the inventory row for this product
    const rows = await tx.$queryRaw`
      SELECT * FROM "Inventory"
      WHERE "productId" = ${productId}
      FOR UPDATE
    `;

    const inventory = Array.isArray(rows) ? rows[0] : rows;

    if (!inventory) {
      throw new ApiError(
        404,
        `Inventory not found for product ${productId}`,
        [],
        "inventory",
      );
    }

    const availableStock = inventory.totalStock - inventory.reservedStock;

    if (availableStock < quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for product ${productId}. Available: ${availableStock}, Requested: ${quantity}`,
        [],
        "inventory",
      );
    }

    await tx.$executeRaw`
      UPDATE "Inventory"
      SET "reservedStock" = "reservedStock" + ${quantity}
      WHERE "productId" = ${productId}
    `;

    return tx.inventory.findUnique({ where: { productId } });
  });

  return result;
};

/**
 * 🔒 Release reserved stock atomically
 * Used when order is cancelled or fails
 */
export const releaseStockService = async (productId, quantity) => {
  // 🔒 Atomic update in transaction
  await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new ApiError(
        404,
        `Inventory not found for product ${productId}`,
        [],
        "inventory",
      );
    }

    // Ensure we don't go below 0
    const newReserved = Math.max(inventory.reservedStock - quantity, 0);

    await tx.inventory.update({
      where: { productId },
      data: {
        reservedStock: newReserved,
      },
    });
  });
};

/**
 * 🔒 Deduct stock permanently after successful payment
 * Converts reserved stock to actual deduction
 */
export const deductStockService = async (productId, quantity) => {
  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      SELECT * FROM "Inventory"
      WHERE "productId" = ${productId}
      FOR UPDATE
    `;

    const inventory = Array.isArray(rows) ? rows[0] : rows;

    if (!inventory) {
      throw new ApiError(
        404,
        `Inventory not found for product ${productId}`,
        [],
        "inventory",
      );
    }

    if (inventory.reservedStock < quantity) {
      throw new ApiError(
        400,
        `Not enough reserved stock for product ${productId}`,
        [],
        "inventory",
      );
    }

    await tx.$executeRaw`
      UPDATE "Inventory"
      SET "totalStock" = "totalStock" - ${quantity},
          "reservedStock" = "reservedStock" - ${quantity}
      WHERE "productId" = ${productId}
        AND "reservedStock" >= ${quantity}
    `;

    return tx.inventory.findUnique({ where: { productId } });
  });

  if (result) {
    const availableStock = result.totalStock - result.reservedStock;
    if (availableStock <= 5) {
      try {
        await produceInventoryEvent(inventoryEvents.STOCK_LOW, {
          productId,
          totalStock: result.totalStock,
          reservedStock: result.reservedStock,
          availableStock,
        });
      } catch (error) {
        console.error("Failed to produce inventory.stock_low event:", error);
      }
    }
  }

  return result;
};

/**
 * Get stock information for a product
 */
export const getStockService = async (productId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) {
    return {
      productId,
      totalStock: 0,
      reservedStock: 0,
      availableStock: 0,
    };
  }

  return {
    productId,
    totalStock: inventory.totalStock,
    reservedStock: inventory.reservedStock,
    availableStock: inventory.totalStock - inventory.reservedStock,
  };
};

/**
 * Initialize inventory for a new product
 * Called when a product is added to the system
 */
export const initializeInventoryService = async (
  productId,
  initialStock = 0,
) => {
  await prisma.inventory.upsert({
    where: { productId },
    update: {}, // No update needed
    create: {
      productId,
      totalStock: initialStock,
      reservedStock: 0,
      availableStock: initialStock,
    },
  });
};

/** 
 * Update total stock for a product (admin operation)
 */
export const updateTotalStockService = async (productId, newTotalStock) => {
  if (newTotalStock < 0) {
    throw new ApiError(400, "Total stock cannot be negative", [], "inventory");
  }

  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) {
    throw new ApiError(
      404,
      `Inventory not found for product ${productId}`,
      [],
      "inventory",
    );
  }

  // Ensure new total doesn't go below reserved stock
  if (newTotalStock < inventory.reservedStock) {
    throw new ApiError(
      400,
      `Cannot set total stock below reserved stock (${inventory.reservedStock})`,
      [],
      "inventory",
    );
  }

  await prisma.inventory.update({
    where: { productId },
    data: {
      totalStock: newTotalStock,
      availableStock: newTotalStock - inventory.reservedStock,
    },
  });

  // Produce Kafka event for stock update
  try {
    await produceInventoryEvent(inventoryEvents.STOCK_UPDATED, {
      productId,
      oldTotalStock: inventory.totalStock,
      newTotalStock,
      reservedStock: inventory.reservedStock,
      availableStock: newTotalStock - inventory.reservedStock,
      updatedBy: "admin",
    });
  } catch (error) {
    console.error("Failed to produce stock updated event:", error);
    // Don't fail the stock update if event production fails
  }
};



// ============================================
// ADMIN INVENTORY MANAGEMENT
// ============================================

/**Checked
 * 🔐 Get all inventory (admin only)
 */
export const getAllInventoryService = async () => {
  const inventory = await prisma.inventory.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return inventory;
};

/** Checked
 * Get inventory for a single product
 */
export const getInventoryService = async (productId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { productId },
  });

  if (!inventory) {
    return {
      productId,
      totalStock: 0,
      reservedStock: 0,
      availableStock: 0,
    };
  }

  return inventory;
};

/** Checked
 * 🔐 Manually update total stock (admin operation)
 * Non-blocking, with event emission
 */
export const updateInventoryManuallyService = async (
  productId,
  newTotalStock,
  reason = "manual_adjustment",
) => {
  if (newTotalStock < 0) {
    throw new ApiError(400, "Total stock cannot be negative", [], "inventory");
  }

  const result = await prisma.$transaction(async (tx) => {
    let inventory = await tx.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      // Create if doesn't exist
      inventory = await tx.inventory.create({
        data: {
          productId,
          totalStock: newTotalStock,
          reservedStock: 0,
          availableStock: newTotalStock,
        },
      });
    } else {
      // Ensure new total doesn't go below reserved stock
      if (newTotalStock < inventory.reservedStock) {
        throw new ApiError(
          400,
          `Cannot set total stock (${newTotalStock}) below reserved stock (${inventory.reservedStock})`,
          [],
          "inventory",
        );
      }

      const oldTotalStock = inventory.totalStock;

      // Update total stock
      inventory = await tx.inventory.update({
        where: { productId },
        data: {
          totalStock: newTotalStock,
          availableStock: newTotalStock - inventory.reservedStock,
        },
      });

      // Save change details for event
      inventory._oldTotalStock = oldTotalStock;
    }

    return inventory;
  });

  // 📢 Produce event (non-blocking)
  try {
    await produceInventoryEvent(inventoryEvents.STOCK_UPDATED, {
      productId,
      oldTotalStock: result._oldTotalStock || 0,
      newTotalStock: result.totalStock,
      reservedStock: result.reservedStock,
      availableStock: result.availableStock,
      reason,
      updatedBy: "admin",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to produce inventory.stock_updated event:", error);
    // Don't fail the update if event production fails
  }

  return result;
};

// ============================================
// BULK STOCK UPLOAD
// ============================================

/** Checked
 * 🔐 Bulk upload/update inventory from CSV or JSON
 * Format: [ { productId, totalStock }, ... ]
 */
export const bulkUpdateInventoryService = async (inventoryData) => {
  if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
    throw new ApiError(
      400,
      "Inventory data must be a non-empty array",
      [],
      "inventory",
    );
  }

  const results = [];
  const errors = [];

  for (const item of inventoryData) {
    try {
      const { productId, totalStock } = item;

      if (!productId) {
        errors.push({
          productId,
          error: "productId is required",
        });
        continue;
      }

      if (typeof totalStock !== "number" || totalStock < 0) {
        errors.push({
          productId,
          error: "totalStock must be a non-negative number",
        });
        continue;
      }

      const result = await updateInventoryManuallyService(
        productId,
        totalStock,
        "bulk_upload",
      );
      results.push(result);
    } catch (error) {
      errors.push({
        productId: item.productId,
        error: error.message,
      });
    }
  }

  return {
    processed: results.length,
    failed: errors.length,
    results,
    errors,
  };
};

/** Checked
 * 🔐 Bulk upload from CSV file content
 * Expected CSV format: productId,totalStock
 */
export const parseAndUploadCSVService = async (csvContent) => {
  const lines = csvContent
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length === 0) {
    throw new ApiError(400, "CSV file is empty", [], "inventory");
  }

  // Skip header if present
  const dataLines = lines[0].toLowerCase().includes("productid")
    ? lines.slice(1)
    : lines;

  const inventoryData = dataLines.map((line, index) => {
    const [productId, totalStock] = line.split(",").map((val) => val.trim());

    if (!productId || !totalStock) {
      throw new ApiError(
        400,
        `Invalid data at line ${index + 1}: productId and totalStock are required`,
        [],
        "inventory",
      );
    }

    return {
      productId,
      totalStock: parseInt(totalStock, 10),
    };
  });

  return await bulkUpdateInventoryService(inventoryData);
};

// ============================================
// SEARCH & FILTER
// ============================================

/**
 * Get inventory for low stock products
 */
export const getLowStockProductsService = async (threshold = 10) => {
  const inventory = await prisma.inventory.findMany({
    where: {
      availableStock: {
        lte: threshold,
      },
    },
    orderBy: { availableStock: "asc" },
  });

  return inventory;
};
