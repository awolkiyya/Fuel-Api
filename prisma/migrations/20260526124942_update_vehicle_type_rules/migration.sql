/*
  Warnings:

  - You are about to drop the column `pricePerLiter` on the `StationSetting` table. All the data in the column will be lost.

*/

-- ===============================
-- STATION SETTINGS
-- ===============================

ALTER TABLE "StationSetting"
DROP COLUMN "pricePerLiter";

-- ===============================
-- VEHICLE TYPE UPDATE
-- ===============================

ALTER TABLE "VehicleType"
ADD COLUMN "code" INTEGER,
ADD COLUMN "requiresBusinessLicense" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "requiresDriverLicense" BOOLEAN NOT NULL DEFAULT true;

-- fill existing rows
UPDATE "VehicleType"
SET "code" = 1
WHERE "code" IS NULL;

-- make required
ALTER TABLE "VehicleType"
ALTER COLUMN "code" SET NOT NULL;

-- unique constraint
CREATE UNIQUE INDEX "VehicleType_code_key"
ON "VehicleType"("code");

-- ===============================
-- NOTIFICATION TABLE
-- ===============================

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ===============================
-- FOREIGN KEYS
-- ===============================

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;