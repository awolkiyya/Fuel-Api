-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "managerId" TEXT;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
