-- CreateEnum
CREATE TYPE "FuelStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "FuelType" ADD COLUMN     "status" "FuelStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt" DROP DEFAULT;
