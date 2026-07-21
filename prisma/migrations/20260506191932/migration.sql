/*
  Warnings:

  - Added the required column `maxLitersPerHour` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "maxLitersPerHour" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxRefillsPerDay" INTEGER,
ADD COLUMN     "minRefillIntervalMinutes" INTEGER;
