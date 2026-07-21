import prisma from "../config/db";

export const seedStations = async () => {
  const station = await prisma.station.create({
    data: {
      name: "Main Station",
      lat: 8.55,
      lng: 39.27,
      status: "ACTIVE",
    },
  });

  return station;
};