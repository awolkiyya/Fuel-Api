/*
  Warnings:

  - Added the required column `thresholdCritical` to the `StationSetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thresholdHigh` to the `StationSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StationSetting" ADD COLUMN     "thresholdCritical" INTEGER NOT NULL,
ADD COLUMN     "thresholdHigh" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "maxTrafficLow" INTEGER NOT NULL DEFAULT 20,
    "maxTrafficMedium" INTEGER NOT NULL DEFAULT 50,
    "maxTrafficHigh" INTEGER NOT NULL DEFAULT 80,
    "maxTrafficCritical" INTEGER NOT NULL DEFAULT 100,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiMinConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "aiRefreshSeconds" INTEGER NOT NULL DEFAULT 5,
    "autoRiskDetection" BOOLEAN NOT NULL DEFAULT true,
    "maxQueueCapacityGlobal" INTEGER NOT NULL DEFAULT 100,
    "maxRequestDistanceKm" INTEGER NOT NULL DEFAULT 10,
    "maxActiveCamerasPerStation" INTEGER NOT NULL DEFAULT 3,
    "systemActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
