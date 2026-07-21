/*
  Warnings:

  - The `status` column on the `Camera` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Tank` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stationId,number]` on the table `Dispenser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dispenserId,number]` on the table `Nozzle` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Camera` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TankStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FULL', 'EMPTY');

-- CreateEnum
CREATE TYPE "DispenserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "NozzleStatus" AS ENUM ('ACTIVE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "CameraType" AS ENUM ('rtsp', 'http', 'webrtc', 'mobile_mock');

-- CreateEnum
CREATE TYPE "CameraStatus" AS ENUM ('online', 'offline', 'testing');

-- CreateEnum
CREATE TYPE "CongestionLevel" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "PriceControlMode" AS ENUM ('FIXED', 'OVERRIDE');

-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "aiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "codec" TEXT,
ADD COLUMN     "fps" INTEGER,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "port" INTEGER,
ADD COLUMN     "resolution" TEXT,
ADD COLUMN     "username" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "CameraType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "CameraStatus" NOT NULL DEFAULT 'offline',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "priceControlMode" "PriceControlMode" NOT NULL DEFAULT 'FIXED';

-- AlterTable
ALTER TABLE "Tank" DROP COLUMN "status",
ADD COLUMN     "status" "TankStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "maxLitersPerHour" DOUBLE PRECISION,
ADD COLUMN     "maxRefillsPerDay" INTEGER,
ADD COLUMN     "minRefillIntervalMinutes" INTEGER,
ALTER COLUMN "maxDailyLiters" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Dispenser_stationId_number_key" ON "Dispenser"("stationId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Nozzle_dispenserId_number_key" ON "Nozzle"("dispenserId", "number");
