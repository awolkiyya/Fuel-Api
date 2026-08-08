/*
  Warnings:

  - You are about to drop the column `remainingLiters` on the `FuelQuota` table. All the data in the column will be lost.
  - You are about to drop the column `allowQuotaFuel` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `availableCredit` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `creditLimit` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `dailyQuotaLiters` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyQuotaLiters` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referenceNumber]` on the table `FuelQuota` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VehicleOwnershipStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "FuelQuota" DROP COLUMN "remainingLiters",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "assignedByUserId" TEXT,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "allowQuotaFuel",
DROP COLUMN "availableCredit",
DROP COLUMN "creditLimit",
DROP COLUMN "dailyQuotaLiters",
DROP COLUMN "monthlyQuotaLiters",
ADD COLUMN     "quotaEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "VehicleOwnershipDocument" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "ownershipNumber" TEXT,
    "documentUrl" TEXT NOT NULL,
    "status" "VehicleOwnershipStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleOwnershipDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleOwnershipDocument_vehicleId_key" ON "VehicleOwnershipDocument"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "FuelQuota_referenceNumber_key" ON "FuelQuota"("referenceNumber");

-- CreateIndex
CREATE INDEX "Organization_status_idx" ON "Organization"("status");

-- CreateIndex
CREATE INDEX "Organization_type_idx" ON "Organization"("type");

-- AddForeignKey
ALTER TABLE "VehicleOwnershipDocument" ADD CONSTRAINT "VehicleOwnershipDocument_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
