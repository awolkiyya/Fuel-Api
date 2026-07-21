-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('GOVERNMENT', 'COMPANY', 'FACTORY', 'NGO');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "TankAuditAction" AS ENUM ('REFILL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('LOSS', 'LEAK', 'CALIBRATION', 'MANUAL_FIX', 'CORRECTION');

-- AlterTable
ALTER TABLE "StationFuelType" ADD COLUMN     "maxRequestLiters" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "minRequestLiters" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "StationSetting" ADD COLUMN     "minFuelRequestLiters" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "TankAuditLog" (
    "id" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "action" "TankAuditAction" NOT NULL,
    "litersChange" DOUBLE PRECISION NOT NULL,
    "previousLevel" DOUBLE PRECISION NOT NULL,
    "newLevel" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "adjustmentType" "AdjustmentType",
    "referenceId" TEXT,
    "performedBy" TEXT NOT NULL,
    "performedRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TankAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "registrationNumber" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyQuotaLiters" DOUBLE PRECISION,
    "dailyQuotaLiters" DOUBLE PRECISION,
    "maxTransactionLiters" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "allowBulkFuel" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgVehicle" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TankAuditLog_tankId_idx" ON "TankAuditLog"("tankId");

-- CreateIndex
CREATE INDEX "TankAuditLog_createdAt_idx" ON "TankAuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_registrationNumber_key" ON "Organization"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_apiKey_key" ON "Organization"("apiKey");

-- AddForeignKey
ALTER TABLE "TankAuditLog" ADD CONSTRAINT "TankAuditLog_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
