-- =====================================================
-- CREATE ENUM
-- =====================================================

CREATE TYPE "EquipmentStatus" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE'
);


-- =====================================================
-- UPDATE DISPENSER STATUS SAFELY
-- =====================================================

ALTER TABLE "Dispenser"
ALTER COLUMN "status" TYPE "EquipmentStatus"
USING (
  CASE
    WHEN "status" = 'active'
      THEN 'ACTIVE'::"EquipmentStatus"

    WHEN "status" = 'inactive'
      THEN 'INACTIVE'::"EquipmentStatus"

    WHEN "status" = 'maintenance'
      THEN 'MAINTENANCE'::"EquipmentStatus"

    ELSE 'ACTIVE'::"EquipmentStatus"
  END
);



-- =====================================================
-- ADD NOZZLE FUEL TYPE ID
-- =====================================================

ALTER TABLE "Nozzle"
ADD COLUMN "fuelTypeId" TEXT;



-- =====================================================
-- MIGRATE EXISTING NOZZLE FUEL DATA
-- =====================================================

UPDATE "Nozzle" n
SET "fuelTypeId" = f."id"
FROM "FuelType" f
WHERE LOWER(f."name") = LOWER(n."fuelType");



-- =====================================================
-- VERIFY DATA
-- =====================================================

-- After this, no nozzle should have NULL fuelTypeId
-- If there is NULL, fix manually before continuing


-- =====================================================
-- MAKE REQUIRED
-- =====================================================

ALTER TABLE "Nozzle"
ALTER COLUMN "fuelTypeId" SET NOT NULL;



-- =====================================================
-- ADD RELATION
-- =====================================================

ALTER TABLE "Nozzle"
ADD CONSTRAINT "Nozzle_fuelTypeId_fkey"
FOREIGN KEY ("fuelTypeId")
REFERENCES "FuelType"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;



-- =====================================================
-- REMOVE OLD STRING COLUMN
-- =====================================================

ALTER TABLE "Nozzle"
DROP COLUMN "fuelType";