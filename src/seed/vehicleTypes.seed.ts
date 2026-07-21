import prisma from "../config/db";

export const seedVehicleTypes = async () => {
  await prisma.vehicleType.createMany({
    data: [
      {
        name: "Car", maxDailyLiters: 40,
        code: 1,
        maxLitersPerHour: 0
      },
      {
        name: "Truck", maxDailyLiters: 120,
        code: 2,
        maxLitersPerHour: 0
      },
      {
        name: "Bike", maxDailyLiters: 10,
        code: 3,
        maxLitersPerHour: 0
      },
    ],
    skipDuplicates: true,
  });
};