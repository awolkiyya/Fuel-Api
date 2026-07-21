import prisma from "../config/db";

export const seedStationTraffic = async (
  stationId: string
) => {
  await prisma.stationTraffic.upsert({
    where: { stationId },

    update: {},

    create: {
      stationId,

      queueCount: 2,

      waitingTimeMin: 10,

      congestionLevel: "LOW",

      updatedBy: "manual",
    },
  });
};