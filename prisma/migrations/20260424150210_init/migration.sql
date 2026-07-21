/*
  Warnings:

  - The `status` column on the `VehicleType` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VehicleTypeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "VehicleType" DROP COLUMN "status",
ADD COLUMN     "status" "VehicleTypeStatus" NOT NULL DEFAULT 'ACTIVE';
