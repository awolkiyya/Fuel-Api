/*
  Warnings:

  - The `status` column on the `Station` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CONGESTED', 'RISK');

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "status",
ADD COLUMN     "status" "StationStatus" NOT NULL DEFAULT 'ACTIVE';
