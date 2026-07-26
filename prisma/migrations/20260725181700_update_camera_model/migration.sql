/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `Camera` table. All the data in the column will be lost.
  - You are about to drop the column `streamUrl` on the `Camera` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Camera` table. All the data in the column will be lost.
  - You are about to drop the column `allowBulkFuel` on the `Organization` table. All the data in the column will be lost.
  - The `paymentStatus` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `OrgVehicle` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `host` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protocol` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Made the column `port` on table `Camera` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CameraProtocol" AS ENUM ('RTSP', 'HTTP', 'HTTPS', 'WEBRTC');

-- CreateEnum
CREATE TYPE "FuelTransactionType" AS ENUM ('NORMAL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIAL');

-- CreateEnum
CREATE TYPE "QuotaPeriodType" AS ENUM ('DAILY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "QuotaStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CameraAuthType" AS ENUM ('NONE', 'BASIC', 'DIGEST', 'TOKEN');

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_fuelRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_vehicleId_fkey";

-- AlterTable
ALTER TABLE "Camera" DROP COLUMN "ipAddress",
DROP COLUMN "streamUrl",
DROP COLUMN "type",
ADD COLUMN     "authType" "CameraAuthType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "host" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "protocol" "CameraProtocol" NOT NULL,
ALTER COLUMN "port" SET NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "allowBulkFuel",
ADD COLUMN     "allowFuelAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowQuotaFuel" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "maxTransactionLiters" SET DEFAULT 5000;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "type" "FuelTransactionType" NOT NULL DEFAULT 'NORMAL',
ALTER COLUMN "fuelRequestId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "vehicleId" DROP NOT NULL,
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "OrgVehicle";

-- DropEnum
DROP TYPE "CameraType";

-- CreateTable
CREATE TABLE "FuelQuota" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "periodType" "QuotaPeriodType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "allocatedLiters" DOUBLE PRECISION NOT NULL,
    "consumedLiters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingLiters" DOUBLE PRECISION NOT NULL,
    "fuelTypeId" TEXT NOT NULL,
    "status" "QuotaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FuelQuota_organizationId_idx" ON "FuelQuota"("organizationId");

-- CreateIndex
CREATE INDEX "FuelQuota_fuelTypeId_idx" ON "FuelQuota"("fuelTypeId");

-- CreateIndex
CREATE INDEX "FuelQuota_status_idx" ON "FuelQuota"("status");

-- CreateIndex
CREATE INDEX "FuelQuota_startDate_endDate_idx" ON "FuelQuota"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Camera_stationId_idx" ON "Camera"("stationId");

-- CreateIndex
CREATE INDEX "Camera_status_idx" ON "Camera"("status");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fuelRequestId_fkey" FOREIGN KEY ("fuelRequestId") REFERENCES "FuelRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelQuota" ADD CONSTRAINT "FuelQuota_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelQuota" ADD CONSTRAINT "FuelQuota_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
