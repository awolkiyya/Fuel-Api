/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Nozzle` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Nozzle` table. All the data in the column will be lost.
  - The `status` column on the `Nozzle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Dispenser" ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Nozzle" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "status",
ADD COLUMN     "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE';
