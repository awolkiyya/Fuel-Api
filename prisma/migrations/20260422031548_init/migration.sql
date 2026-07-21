/*
  Warnings:

  - You are about to drop the `FuelRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Station` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StationSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StationTraffic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehicleType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[firebase_uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'station_manager', 'station_staff', 'driver');

-- DropForeignKey
ALTER TABLE "FuelRequest" DROP CONSTRAINT "FuelRequest_stationId_fkey";

-- DropForeignKey
ALTER TABLE "FuelRequest" DROP CONSTRAINT "FuelRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "FuelRequest" DROP CONSTRAINT "FuelRequest_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Station" DROP CONSTRAINT "Station_managerId_fkey";

-- DropForeignKey
ALTER TABLE "StationSetting" DROP CONSTRAINT "StationSetting_stationId_fkey";

-- DropForeignKey
ALTER TABLE "StationTraffic" DROP CONSTRAINT "StationTraffic_stationId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_fuelRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_stationId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_vehicleTypeId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firebase_uid" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- DropTable
DROP TABLE "FuelRequest";

-- DropTable
DROP TABLE "Station";

-- DropTable
DROP TABLE "StationSetting";

-- DropTable
DROP TABLE "StationTraffic";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "Vehicle";

-- DropTable
DROP TABLE "VehicleType";

-- CreateTable
CREATE TABLE "DriverProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_userId_key" ON "DriverProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_nationalId_key" ON "DriverProfile"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_licenseNumber_key" ON "DriverProfile"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
