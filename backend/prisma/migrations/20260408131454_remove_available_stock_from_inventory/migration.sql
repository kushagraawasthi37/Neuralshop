/*
  Warnings:

  - You are about to drop the column `availableStock` on the `Inventory` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Address_userId_isDefault_key";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "availableStock";
