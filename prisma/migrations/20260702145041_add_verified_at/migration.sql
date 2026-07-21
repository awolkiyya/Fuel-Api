/*
  Warnings:

  - The values [PROCESSING] on the enum `FuelRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FuelRequestStatus_new" AS ENUM ('PENDING', 'VERIFIED', 'APPROVED', 'ASSIGNED', 'DISPENSING', 'COMPLETED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."FuelRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FuelRequest" ALTER COLUMN "status" TYPE "FuelRequestStatus_new" USING ("status"::text::"FuelRequestStatus_new");
ALTER TYPE "FuelRequestStatus" RENAME TO "FuelRequestStatus_old";
ALTER TYPE "FuelRequestStatus_new" RENAME TO "FuelRequestStatus";
DROP TYPE "public"."FuelRequestStatus_old";
ALTER TABLE "FuelRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "FuelRequest" ADD COLUMN     "verifiedAt" TIMESTAMP(3);
