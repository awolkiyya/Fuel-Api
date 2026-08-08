/*
  Warnings:

  - You are about to drop the column `isVerified` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `licenseExpiry` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `licenseFile` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `licenseIssuedAt` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `DriverProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DriverLicenseStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "DriverProfile" DROP CONSTRAINT "DriverProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "DriverProfile" DROP CONSTRAINT "DriverProfile_verifiedBy_fkey";

-- DropIndex
DROP INDEX "DriverProfile_licenseNumber_key";

-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "isVerified",
DROP COLUMN "licenseExpiry",
DROP COLUMN "licenseFile",
DROP COLUMN "licenseIssuedAt",
DROP COLUMN "licenseNumber",
DROP COLUMN "verifiedAt",
DROP COLUMN "verifiedBy";

-- CreateTable
CREATE TABLE "DriverLicense" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "documentUrl" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "status" "DriverLicenseStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_driverId_key" ON "DriverLicense"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverLicense_licenseNumber_key" ON "DriverLicense"("licenseNumber");

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicense" ADD CONSTRAINT "DriverLicense_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "DriverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
