-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "attendantId" TEXT,
ADD COLUMN     "nozzleId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_nozzleId_fkey" FOREIGN KEY ("nozzleId") REFERENCES "Nozzle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
