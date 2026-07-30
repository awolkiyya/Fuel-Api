/*
  Warnings:

  - The values [RENEW] on the enum `BusinessLicenseRequestType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BusinessLicenseRequestType_new" AS ENUM ('NEW', 'RENEWAL');
ALTER TABLE "BusinessLicense" ALTER COLUMN "requestType" TYPE "BusinessLicenseRequestType_new" USING ("requestType"::text::"BusinessLicenseRequestType_new");
ALTER TYPE "BusinessLicenseRequestType" RENAME TO "BusinessLicenseRequestType_old";
ALTER TYPE "BusinessLicenseRequestType_new" RENAME TO "BusinessLicenseRequestType";
DROP TYPE "public"."BusinessLicenseRequestType_old";
COMMIT;

-- AlterTable
ALTER TABLE "BusinessLicense" ADD COLUMN     "rejectionReason" TEXT;
