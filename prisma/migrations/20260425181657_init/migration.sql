/*
  Warnings:

  - You are about to drop the column `totalCapacity` on the `StationFuelType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stationId,fuelTypeId]` on the table `StationFuelType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxCapacity` to the `StationFuelType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StationFuelType" DROP COLUMN "totalCapacity",
ADD COLUMN     "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "maxCapacity" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "StationFuelType_stationId_idx" ON "StationFuelType"("stationId");

-- CreateIndex
CREATE INDEX "StationFuelType_fuelTypeId_idx" ON "StationFuelType"("fuelTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "StationFuelType_stationId_fuelTypeId_key" ON "StationFuelType"("stationId", "fuelTypeId");
