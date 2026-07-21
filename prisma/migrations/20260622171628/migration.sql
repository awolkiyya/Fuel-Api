/*
  Warnings:

  - You are about to drop the column `password` on the `Camera` table. All the data in the column will be lost.
  - Existing rows in `BusinessLicense` will be initialized with requestType = 'NEW'.

*/

-- CreateEnum
CREATE TYPE "BusinessLicenseRequestType" AS ENUM ('NEW', 'RENEW');

-- =====================================================
-- BusinessLicense
-- =====================================================

ALTER TABLE "BusinessLicense"
ADD COLUMN "requestType" "BusinessLicenseRequestType"
NOT NULL DEFAULT 'NEW';

-- Optional: Remove the default so future inserts must explicitly provide requestType
ALTER TABLE "BusinessLicense"
ALTER COLUMN "requestType" DROP DEFAULT;

-- =====================================================
-- Camera
-- =====================================================

ALTER TABLE "Camera"
DROP COLUMN "password",
ADD COLUMN "passwordEncrypted" TEXT,
ADD COLUMN "queueZone" JSONB,
ADD COLUMN "thresholds" JSONB,
ALTER COLUMN "port" SET DEFAULT 554;