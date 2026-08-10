import express from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import ApiResponse from "../../utils/api-response.js";
import { ApiError } from "../../utils/api-error.js";
import {
  getAllInventoryService,
  getInventoryService,
  updateInventoryManuallyService,
  bulkUpdateInventoryService,
  parseAndUploadCSVService,
  getLowStockProductsService,
} from "./inventory.service.js";
import multer from "multer";
import { isAuthAdmin } from "../../middlewares/auth.middleware.js";

const router = express.Router();

export const getIncomingInventorySize = (req) => {
  const rawSize = req.body?.size ?? req.query?.size;

  if (typeof rawSize === "string") {
    const trimmed = rawSize.trim();
    return trimmed || null;
  }

  if (typeof rawSize === "number" && Number.isFinite(rawSize)) {
    return String(rawSize);
  }

  return null;
};

// Multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv" && !file.originalname.endsWith(".csv")) {
      return cb(
        new ApiError(400, "Only CSV files are allowed", [], "inventory"),
      );
    }
    cb(null, true);
  },
});

// ============================================
// 🔐 ADMIN INVENTORY ENDPOINTS
// ============================================

router.get(
  "/low-stock",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const threshold = parseInt(req.query.threshold || "10", 10);

    if (threshold < 0) {
      throw new ApiError(400, "Threshold cannot be negative", [], "inventory");
    }

    const products = await getLowStockProductsService(req.adminId, threshold);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          `Low stock products (threshold: ${threshold})`,
        ),
      );
  }),
);

/** Checked
 * POST /admin/inventory/bulk/json
 * Bulk update inventory from JSON array
 * Body: { inventory: [ { productId: "...", totalStock: 100 }, ... ] }
 */
router.post(
  "/bulk/json",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const { inventory } = req.body;

    if (!Array.isArray(inventory)) {
      throw new ApiError(400, "Inventory must be an array", [], "inventory");
    }

    const result = await bulkUpdateInventoryService(req.adminId, inventory);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Bulk inventory update completed"));
  }),
);

/** Checked
 * POST /admin/inventory/bulk/csv
 * Bulk upload inventory from CSV file
 * CSV format: productId,totalStock
 * Example:
 *   productId,totalStock
 *   prod_001,100
 *   prod_002,250
 */
router.post(
  "/bulk/csv",
  isAuthAdmin,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "CSV file is required", [], "inventory");
    }

    const csvContent = req.file.buffer.toString("utf-8");
    const result = await parseAndUploadCSVService(req.adminId, csvContent);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "CSV inventory upload completed"));
  }),
);

/**  Checked
 * GET /admin/inventory/low-stock
 * Get products with low stock (below threshold)
 * Query: ?threshold=10 (default: 10)
 */

/**  Cheked
 * PATCH /admin/inventory/:productId
 * Manually update total stock for a product
 * Body: { totalStock: 100, reason?: "restock" }
 */
router.patch(
  "/:productId",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { totalStock, reason } = req.body;
    const size = getIncomingInventorySize(req);

    if (!size) {
      throw new ApiError(400, "size is required", [], "inventory");
    }

    if (typeof totalStock !== "number") {
      throw new ApiError(400, "totalStock must be a number", [], "inventory");
    }

    const result = await updateInventoryManuallyService(
      req.adminId,
      productId,
      size,
      totalStock,
      reason,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Inventory updated successfully"));
  }),
);

/**  Checked
 * GET /admin/inventory/:productId
 * Get inventory for specific product
 */
router.get(
  "/:productId",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const size = getIncomingInventorySize(req);

    if (!size) {
      throw new ApiError(400, "size is required", [], "inventory");
    }

    const inventory = await getInventoryService(req.adminId, productId, size);
    return res
      .status(200)
      .json(
        new ApiResponse(200, inventory, "Inventory retrieved successfully"),
      );
  }),
);

/**  Checked
 * GET /admin/inventory
 * Get all inventory
 */
router.get(
  "/",
  isAuthAdmin,
  asyncHandler(async (req, res) => {
    const inventory = await getAllInventoryService(req.adminId);
    return res
      .status(200)
      .json(
        new ApiResponse(200, inventory, "Inventory retrieved successfully"),
      );
  }),
);

export default router;
