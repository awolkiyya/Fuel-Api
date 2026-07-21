/*
  Warnings:

  - Added the required column `waitingTimeMin` to the `StationTraffic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StationTraffic" ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "waitingTimeMin" DOUBLE PRECISION NOT NULL;
