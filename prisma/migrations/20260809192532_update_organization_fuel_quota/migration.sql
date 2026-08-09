/*
  Warnings:

  - The values [PENDING_APPROVAL] on the enum `OrgStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [COMPANY,FACTORY] on the enum `OrgType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `allocatedLiters` on the `FuelQuota` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `consumedLiters` on the `FuelQuota` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `quotaEnabled` on the `Organization` table. All the data in the column will be lost.
  - You are about to alter the column `maxTransactionLiters` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrgStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED');
ALTER TABLE "public"."Organization" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Organization" ALTER COLUMN "status" TYPE "OrgStatus_new" USING ("status"::text::"OrgStatus_new");
ALTER TYPE "OrgStatus" RENAME TO "OrgStatus_old";
ALTER TYPE "OrgStatus_new" RENAME TO "OrgStatus";
DROP TYPE "public"."OrgStatus_old";
ALTER TABLE "Organization" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrgType_new" AS ENUM ('GOVERNMENT', 'PUBLIC_INSTITUTION', 'PRIVATE_COMPANY', 'NGO', 'OTHER');
ALTER TABLE "Organization" ALTER COLUMN "type" TYPE "OrgType_new" USING ("type"::text::"OrgType_new");
ALTER TYPE "OrgType" RENAME TO "OrgType_old";
ALTER TYPE "OrgType_new" RENAME TO "OrgType";
DROP TYPE "public"."OrgType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuotaPeriodType" ADD VALUE 'WEEKLY';
ALTER TYPE "QuotaPeriodType" ADD VALUE 'QUARTERLY';
ALTER TYPE "QuotaPeriodType" ADD VALUE 'CUSTOM';

-- AlterEnum
ALTER TYPE "QuotaStatus" ADD VALUE 'EXHAUSTED';

-- DropForeignKey
ALTER TABLE "FuelQuota" DROP CONSTRAINT "FuelQuota_organizationId_fkey";

-- AlterTable
ALTER TABLE "FuelQuota" ALTER COLUMN "allocatedLiters" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "consumedLiters" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "quotaEnabled",
ADD COLUMN     "requiresQuota" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "maxTransactionLiters" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "FuelQuota_assignedByUserId_idx" ON "FuelQuota"("assignedByUserId");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- AddForeignKey
ALTER TABLE "FuelQuota" ADD CONSTRAINT "FuelQuota_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelQuota" ADD CONSTRAINT "FuelQuota_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
