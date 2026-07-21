import prisma from "../config/db";

export const seedStationSettings = async (
  stationId: string
) => {
  await prisma.stationSetting.create({
    data: {
      stationId,

      queueZone: {
        x1: 100,
        y1: 200,
        x2: 800,
        y2: 600,
      },

      thresholdLow: 3,
      thresholdMedium: 7,
      thresholdHigh: 10,
      thresholdCritical: 15,

      maxQueueCapacity: 15,

      minFuelRequestLiters: 1,
    },
  });
};