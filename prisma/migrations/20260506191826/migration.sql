/*
  Warnings:

  - You are about to drop the column `maxLitersPerHour` on the `VehicleType` table. All the data in the column will be lost.
  - You are about to drop the column `maxRefillsPerDay` on the `VehicleType` table. All the data in the column will be lost.
  - You are about to drop the column `minRefillIntervalMinutes` on the `VehicleType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VehicleType" DROP COLUMN "maxLitersPerHour",
DROP COLUMN "maxRefillsPerDay",
DROP COLUMN "minRefillIntervalMinutes";
