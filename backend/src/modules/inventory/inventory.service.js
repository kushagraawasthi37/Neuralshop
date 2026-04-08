import prisma from "../../prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { produceInventoryEvent } from "../../events/producers/inventory.producer.js";
import { inventoryEvents } from "../../events/event-types.js";

const validateProductId = (productId) => {
  if (!productId || typeof productId !== "string" || !productId.trim()) {
    throw new ApiError(400, "Invalid productId", [], "inventory");
  }
};

const validateSize = (size) => {
  if (!size || typeof size !== "string" || !size.trim()) {
    throw new ApiError(400, "Invalid size", [], "inventory");
  }
};

const validateQuantity = (quantity) => {
  if (
    quantity == null ||
    typeof quantity !== "number" ||
    quantity <= 0 ||
    !Number.isInteger(quantity)
  ) {
    throw new ApiError(
      400,
      "quantity must be positive integer",
      [],
      "inventory",
    );
  }
};

export const reserveStockService = async (productId, size, quantity) => {
  validateProductId(productId);
  validateSize(size);
  validateQuantity(quantity);

  const result = await prisma.$queryRaw`
    UPDATE "Inventory"
    SET "reservedStock" = "reservedStock" + ${quantity}
    WHERE "productId" = ${productId} 
      AND "size" = ${size}
      AND ("totalStock" - "reservedStock") >= ${quantity}
    RETURNING *
  `;

  if (!result || result.length === 0) {
    throw new ApiError(
      409,
      "Insufficient stock or inventory not found",
      [],
      "inventory",
    );
  }

  return result[0];
};

export const releaseStockService = async (productId, size, quantity) => {
  validateProductId(productId);
  validateSize(size);
  validateQuantity(quantity);

  const result = await prisma.$queryRaw`
    UPDATE "Inventory"
    SET "reservedStock" = "reservedStock" - ${quantity}
    WHERE "productId" = ${productId} 
      AND "size" = ${size}
      AND "reservedStock" >= ${quantity}
    RETURNING *
  `;

  if (!result || result.length === 0) {
    throw new ApiError(
      409,
      "Cannot release more than reserved or inventory not found",
      [],
      "inventory",
    );
  }

  return result[0];
};

export const deductStockService = async (
  productId,
  size,
  quantity,
  idempotencyKey = null,
) => {
  validateProductId(productId);
  validateSize(size);
  validateQuantity(quantity);

  if (idempotencyKey) {
    if (typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
      throw new ApiError(400, "Invalid idempotency key", [], "inventory");
    }

    try {
      await prisma.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          userId: "system",
          method: "INTERNAL",
          endpoint: "inventory_deduct",
          response: {},
          status: "pending",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        const existing = await prisma.idempotencyKey.findUnique({
          where: { key: idempotencyKey },
        });
        if (existing.status === "completed") {
          return existing.response;
        }
        throw new ApiError(409, "Deduction in progress", [], "inventory");
      }
      throw err;
    }
  }

  try {
    const result = await prisma.$queryRaw`
      UPDATE "Inventory"
      SET "totalStock" = "totalStock" - ${quantity},
          "reservedStock" = "reservedStock" - ${quantity}
      WHERE "productId" = ${productId} 
        AND "size" = ${size}
        AND "reservedStock" >= ${quantity}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      throw new ApiError(
        409,
        "Insufficient reserved stock or inventory not found",
        [],
        "inventory",
      );
    }

    const updated = result[0];

    if (idempotencyKey) {
      const response = {
        productId: updated.productId,
        size: updated.size,
        totalStock: updated.totalStock,
        reservedStock: updated.reservedStock,
      };

      await prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { response, status: "completed" },
      });
    }

    const availableStock = updated.totalStock - updated.reservedStock;
    if (availableStock <= 5) {
      produceInventoryEvent(inventoryEvents.STOCK_LOW, {
        productId,
        size,
        totalStock: updated.totalStock,
        reservedStock: updated.reservedStock,
        availableStock,
      }).catch((error) => {
        console.error("Failed to produce inventory.stock_low event:", error);
      });
    }

    return updated;
  } catch (error) {
    if (idempotencyKey) {
      await prisma.idempotencyKey
        .updateMany({
          where: { key: idempotencyKey, status: "pending" },
          data: { status: "failed" },
        })
        .catch(() => {});
    }
    throw error;
  }
};

export const getStockService = async (productId, size) => {
  validateProductId(productId);
  validateSize(size);

  const inventory = await prisma.inventory.findUnique({
    where: { productId_size: { productId, size } },
  });

  if (!inventory) {
    return {
      productId,
      size,
      totalStock: 0,
      reservedStock: 0,
      availableStock: 0,
    };
  }

  return {
    productId: inventory.productId,
    size: inventory.size,
    totalStock: inventory.totalStock,
    reservedStock: inventory.reservedStock,
    availableStock: inventory.totalStock - inventory.reservedStock,
  };
};

export const initializeInventoryService = async (
  productId,
  size,
  initialStock = 0,
) => {
  validateProductId(productId);
  validateSize(size);

  if (
    typeof initialStock !== "number" ||
    initialStock < 0 ||
    !Number.isInteger(initialStock)
  ) {
    throw new ApiError(
      400,
      "initialStock must be non-negative integer",
      [],
      "inventory",
    );
  }

  await prisma.inventory.upsert({
    where: { productId_size: { productId, size } },
    update: {},
    create: {
      productId,
      size,
      totalStock: initialStock,
      reservedStock: 0,
    },
  });
};

export const updateTotalStockService = async (
  productId,
  size,
  newTotalStock,
) => {
  validateProductId(productId);
  validateSize(size);

  if (
    typeof newTotalStock !== "number" ||
    newTotalStock < 0 ||
    !Number.isInteger(newTotalStock)
  ) {
    throw new ApiError(
      400,
      "newTotalStock must be non-negative integer",
      [],
      "inventory",
    );
  }

  const result = await prisma.$queryRaw`
    UPDATE "Inventory"
    SET "totalStock" = ${newTotalStock}
    WHERE "productId" = ${productId}
    AND "size" = ${size}
    AND "reservedStock" <= ${newTotalStock}
    RETURNING *
  `;

  if (!result || result.length === 0) {
    throw new ApiError(409, "Invalid stock update", [], "inventory");
  }

  const updated = result[0];

  produceInventoryEvent(inventoryEvents.STOCK_UPDATED, {
    productId,
    size,
    newTotalStock,
    reservedStock: updated.reservedStock,
    availableStock: updated.totalStock - updated.reservedStock,
  }).catch(() => {});

  return updated;
};

// ============================================
// ADMIN INVENTORY MANAGEMENT
// ============================================

export const getAllInventoryService = async () => {
  const inventory = await prisma.inventory.findMany({
    orderBy: [{ productId: "asc" }, { size: "asc" }, { updatedAt: "desc" }],
  });

  return inventory.map((inv) => ({
    productId: inv.productId,
    size: inv.size,
    totalStock: inv.totalStock,
    reservedStock: inv.reservedStock,
    availableStock: inv.totalStock - inv.reservedStock,
    updatedAt: inv.updatedAt,
  }));
};

export const getInventoryService = async (productId, size) => {
  validateProductId(productId);
  validateSize(size);

  const inventory = await prisma.inventory.findUnique({
    where: { productId_size: { productId, size } },
  });

  if (!inventory) {
    return {
      productId,
      size,
      totalStock: 0,
      reservedStock: 0,
      availableStock: 0,
    };
  }

  return {
    productId: inventory.productId,
    size: inventory.size,
    totalStock: inventory.totalStock,
    reservedStock: inventory.reservedStock,
    availableStock: inventory.totalStock - inventory.reservedStock,
    updatedAt: inventory.updatedAt,
  };
};

export const updateInventoryManuallyService = async (
  productId,
  size,
  newTotalStock,
  reason = "manual_adjustment",
) => {
  validateProductId(productId);
  validateSize(size);

  if (
    typeof newTotalStock !== "number" ||
    newTotalStock < 0 ||
    !Number.isInteger(newTotalStock)
  ) {
    throw new ApiError(
      400,
      "newTotalStock must be non-negative integer",
      [],
      "inventory",
    );
  }

  if (typeof reason !== "string" || !reason.trim()) {
    throw new ApiError(400, "reason must be non-empty string", [], "inventory");
  }

  let result = await prisma.inventory.findUnique({
    where: { productId_size: { productId, size } },
  });

  if (!result) {
    result = await prisma.inventory.create({
      data: {
        productId,
        size,
        totalStock: newTotalStock,
        reservedStock: 0,
      },
    });
  } else {
    if (newTotalStock < result.reservedStock) {
      throw new ApiError(
        400,
        "Cannot set below reserved stock",
        [],
        "inventory",
      );
    }

    result = await prisma.inventory.update({
      where: { productId_size: { productId, size } },
      data: { totalStock: newTotalStock },
    });
  }

  produceInventoryEvent(inventoryEvents.STOCK_UPDATED, {
    productId,
    size,
    newTotalStock: result.totalStock,
    reservedStock: result.reservedStock,
    availableStock: result.totalStock - result.reservedStock,
    reason,
  }).catch((error) => {
    console.error("Failed to produce inventory.stock_updated event:", error);
  });

  return result;
};

// ============================================
// BULK STOCK UPLOAD
// ============================================

export const bulkUpdateInventoryService = async (inventoryData) => {
  if (!Array.isArray(inventoryData) || inventoryData.length === 0) {
    throw new ApiError(
      400,
      "Inventory data must be non-empty array",
      [],
      "inventory",
    );
  }

  const validated = [];
  const validationErrors = [];

  for (let i = 0; i < inventoryData.length; i++) {
    const item = inventoryData[i];

    try {
      if (
        !item.productId ||
        typeof item.productId !== "string" ||
        !item.productId.trim()
      ) {
        throw new ApiError(400, "productId required", [], "inventory");
      }

      if (!item.size || typeof item.size !== "string" || !item.size.trim()) {
        throw new ApiError(400, "size required", [], "inventory");
      }

      if (
        typeof item.totalStock !== "number" ||
        item.totalStock < 0 ||
        !Number.isInteger(item.totalStock)
      ) {
        throw new ApiError(
          400,
          "totalStock must be non-negative integer",
          [],
          "inventory",
        );
      }

      validated.push({
        productId: item.productId.trim(),
        size: item.size.trim(),
        totalStock: item.totalStock,
      });
    } catch (error) {
      validationErrors.push({
        index: i,
        productId: item.productId,
        size: item.size,
        error: error.message,
      });
    }
  }

  if (validated.length === 0) {
    throw new ApiError(400, "No valid inventory items", [], "inventory");
  }

  const results = [];
  const errors = [...validationErrors];

  for (const item of validated) {
    try {
      let inventory = await prisma.inventory.findUnique({
        where: {
          productId_size: { productId: item.productId, size: item.size },
        },
      });

      if (!inventory) {
        inventory = await prisma.inventory.create({
          data: {
            productId: item.productId,
            size: item.size,
            totalStock: item.totalStock,
            reservedStock: 0,
          },
        });
      } else {
        if (item.totalStock < inventory.reservedStock) {
          throw new ApiError(
            400,
            "Cannot set below reserved stock",
            [],
            "inventory",
          );
        }

        inventory = await prisma.inventory.update({
          where: {
            productId_size: { productId: item.productId, size: item.size },
          },
          data: { totalStock: item.totalStock },
        });
      }

      results.push({
        productId: inventory.productId,
        size: inventory.size,
        totalStock: inventory.totalStock,
        reservedStock: inventory.reservedStock,
        availableStock: inventory.totalStock - inventory.reservedStock,
      });

      produceInventoryEvent(inventoryEvents.STOCK_UPDATED, {
        productId: inventory.productId,
        size: inventory.size,
        newTotalStock: inventory.totalStock,
        reason: "bulk_upload",
      }).catch((error) => {
        console.error("Failed to produce event:", error);
      });
    } catch (error) {
      errors.push({
        productId: item.productId,
        size: item.size,
        error: error.message,
      });
    }
  }

  return {
    processed: results.length,
    failed: errors.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
};

export const parseAndUploadCSVService = async (csvContent) => {
  if (!csvContent || typeof csvContent !== "string") {
    throw new ApiError(400, "CSV content required", [], "inventory");
  }

  const lines = csvContent
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length === 0) {
    throw new ApiError(400, "CSV is empty", [], "inventory");
  }

  const dataLines = lines[0].toLowerCase().includes("productid")
    ? lines.slice(1)
    : lines;

  const inventoryData = [];

  for (let i = 0; i < dataLines.length; i++) {
    const [productId, size, totalStockStr] = dataLines[i]
      .split(",")
      .map((val) => val.trim());

    if (!productId || !size || !totalStockStr) {
      throw new ApiError(400, `Invalid CSV at line ${i + 1}`, [], "inventory");
    }

    const totalStock = parseInt(totalStockStr, 10);
    if (!Number.isInteger(totalStock) || totalStock < 0) {
      throw new ApiError(
        400,
        `Invalid totalStock at line ${i + 1}`,
        [],
        "inventory",
      );
    }

    inventoryData.push({
      productId,
      size,
      totalStock,
    });
  }

  return await bulkUpdateInventoryService(inventoryData);
};

// ============================================
// SEARCH & FILTER
// ============================================

export const getLowStockProductsService = async (threshold = 10) => {
  if (
    typeof threshold !== "number" ||
    threshold < 0 ||
    !Number.isInteger(threshold)
  ) {
    throw new ApiError(
      400,
      "threshold must be non-negative integer",
      [],
      "inventory",
    );
  }

  const inventory = await prisma.$queryRaw`
    SELECT * FROM "Inventory"
    WHERE ("totalStock" - "reservedStock") <= ${threshold}
    ORDER BY ("totalStock" - "reservedStock") ASC, "productId" ASC, "size" ASC
  `;

  return inventory.map((inv) => ({
    productId: inv.productId,
    size: inv.size,
    totalStock: inv.totalStock,
    reservedStock: inv.reservedStock,
    availableStock: inv.totalStock - inv.reservedStock,
  }));
};
