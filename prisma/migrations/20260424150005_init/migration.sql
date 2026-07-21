-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "updatedAt" DROP DEFAULT;
