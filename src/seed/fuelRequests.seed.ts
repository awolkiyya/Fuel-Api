import prisma from "../config/db";

export const seedFuelRequest = async (
  userId: string,
  vehicleId: string,
  stationId: string,
  fuelTypeId: string
) => {
  await prisma.fuelRequest.create({
    data: {
      userId,
      vehicleId,
      stationId,
      fuelTypeId,

      requestedLiters: 20,
      approvedLiters: 20,

      status: "APPROVED",
    },
  });
};