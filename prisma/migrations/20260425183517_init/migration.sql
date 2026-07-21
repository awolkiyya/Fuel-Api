/*
  Warnings:

  - You are about to drop the column `currentStock` on the `StationFuelType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StationFuelType" DROP COLUMN "currentStock",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
