-- DropIndex
DROP INDEX "VehicleType_code_key";

-- AlterTable
ALTER TABLE "VehicleType" ADD COLUMN     "category" TEXT,
ADD COLUMN     "codeLabel" TEXT;

-- CreateIndex
CREATE INDEX "VehicleType_code_idx" ON "VehicleType"("code");

-- CreateIndex
CREATE INDEX "VehicleType_category_idx" ON "VehicleType"("category");
