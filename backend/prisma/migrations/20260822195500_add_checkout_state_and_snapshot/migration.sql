ALTER TABLE "Order" ADD COLUMN "checkoutState" TEXT NOT NULL DEFAULT 'CREATED';
ALTER TABLE "Order" ADD COLUMN "checkoutSnapshot" JSONB;
UPDATE "Order" SET "checkoutState" = 'RESERVED' WHERE "status" = 'PENDING';