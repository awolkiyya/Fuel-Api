-- CreateTable
CREATE TABLE "StationFuelPrice" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "fuelTypeId" TEXT NOT NULL,
    "pricePerLiter" DOUBLE PRECISION NOT NULL,
    "isOverride" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StationFuelPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StationFuelPrice_stationId_fuelTypeId_idx" ON "StationFuelPrice"("stationId", "fuelTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "StationFuelPrice_stationId_fuelTypeId_key" ON "StationFuelPrice"("stationId", "fuelTypeId");

-- AddForeignKey
ALTER TABLE "StationFuelPrice" ADD CONSTRAINT "StationFuelPrice_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationFuelPrice" ADD CONSTRAINT "StationFuelPrice_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
