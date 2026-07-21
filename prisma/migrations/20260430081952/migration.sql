/*
  Warnings:

  - A unique constraint covering the columns `[managerId]` on the table `Station` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Station_managerId_key" ON "Station"("managerId");
