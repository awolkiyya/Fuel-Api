/*
  Warnings:

  - You are about to drop the column `queueZone` on the `Camera` table. All the data in the column will be lost.
  - You are about to drop the column `thresholds` on the `Camera` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Camera" DROP COLUMN "queueZone",
DROP COLUMN "thresholds";
