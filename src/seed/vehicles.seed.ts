import prisma from "../config/db";

export const seedVehicles = async (userId: string) => {
  console.log("🚗 Seeding vehicles (bulk for pagination)...");

  const vehicleTypes = await prisma.vehicleType.findMany({
    include: {
      allowedFuelTypes: true,
    },
  });

  if (vehicleTypes.length === 0) {
    throw new Error("No vehicle types found. Seed vehicle types first.");
  }

  const TOTAL = 50; // 🔥 increase for pagination testing

  const results = [];

  for (let i = 0; i < TOTAL; i++) {
    /// ---------------- RANDOM TYPE ----------------
    const vehicleType =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

    const fuelType =
      vehicleType.allowedFuelTypes?.[0] ??
      (await prisma.fuelType.findFirst());

    if (!fuelType) continue;

    /// ---------------- UNIQUE DATA ----------------
    const plateNumber = `AA-${10000 + i}`; // ✅ unique
    const vin = `VIN-${vehicleType.name.toUpperCase()}-${i}`;

    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber },
    
      update: {
        vehicleTypeId: vehicleType.id,
        fuelTypeId: fuelType.id,
        vin,
        fuelCapacity: Math.floor(Math.random() * 200) + 20,
        isVerified: Math.random() > 0.5,
        userId,
      },
    
      create: {
        userId,
        vehicleTypeId: vehicleType.id,
        fuelTypeId: fuelType.id,
      
        plateNumber,
        vin,
      
        fuelCapacity: Math.floor(Math.random() * 200) + 20,
      
        regionCode: "OR",
      
        isVerified: Math.random() > 0.5,
      },
    });

    results.push(vehicle);

    console.log(
      `✅ ${vehicle.plateNumber} | ${vehicleType.name} | ${
        vehicle.isVerified ? "verified" : "unverified"
      }`
    );
  }

  console.log(`🚀 Seed completed: ${results.length} vehicles`);

  return results;
};