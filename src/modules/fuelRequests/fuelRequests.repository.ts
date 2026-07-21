import prisma from "../../config/db";
import { CreateFuelRequestDTO } from "./fuelRequests.types";

export const fuelRequestRepository = {
  create: async (data: CreateFuelRequestDTO & { userId: string }) => {
    return prisma.fuelRequest.create({
      data: {
        ...data,
        status: "PENDING",
      },
    });
  },

  findAll: async () => {
    return prisma.fuelRequest.findMany({
      include: {
        vehicle: true,
        station: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: async (id: string) => {
    return prisma.fuelRequest.findUnique({
      where: { id },
      include: {
        vehicle: true,
        station: true,
        user: true,
      },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.fuelRequest.update({
      where: { id },
      data,
    });
  },
};