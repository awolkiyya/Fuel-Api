import prisma from "../../config/db";

export const transactionRepository = {
  create: async (data: any) => {
    return prisma.transaction.create({
      data,
    });
  },

  findAll: async () => {
    return prisma.transaction.findMany({
      include: {
        user: true,
        vehicle: true,
        station: true,
        fuelRequest: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: async (id: string) => {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        user: true,
        vehicle: true,
        station: true,
        fuelRequest: true,
      },
    });
  },
};