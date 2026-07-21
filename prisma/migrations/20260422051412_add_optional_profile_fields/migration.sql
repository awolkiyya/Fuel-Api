/*
  Warnings:

  - Added the required column `age` to the `DriverProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "age" INTEGER NOT NULL;
