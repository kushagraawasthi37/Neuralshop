ALTER TABLE "Inventory" ADD COLUMN "id" TEXT NOT NULL DEFAULT (gen_random_uuid()::text);
ALTER TABLE "Inventory" ADD COLUMN "adminId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_pkey";
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "Inventory_adminId_productId_size_key" ON "Inventory"("adminId", "productId", "size");
CREATE INDEX "Inventory_adminId_idx" ON "Inventory"("adminId");
CREATE INDEX "Inventory_adminId_productId_idx" ON "Inventory"("adminId", "productId");