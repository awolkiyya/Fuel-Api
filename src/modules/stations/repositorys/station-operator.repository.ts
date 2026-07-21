import { FuelRequestStatus } from "@prisma/client"
import prisma from "../../../config/db"

export const fuelRequestRepository = {
  findStationRequests: async ({
    where,
    skip,
    take,
    orderBy,
  }: any) => {
    const [data, total] = await Promise.all([
      prisma.fuelRequest.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          // ================= USER (DRIVER) =================
          user: {
            include: {
              driverProfile: true,
  
              // optional but useful if exists in schema
              risks: {
                take: 1,
                orderBy: { createdAt: "desc" },
              },
            },
          },
  
          // ================= VEHICLE =================
          vehicle: {
            include: {
              vehicleType: true,
              fuelType: true,
            },
          },
  
          station: true,
          fuelType: true,
          nozzle: true,
          rejectionReason: true,
        },
      }),
  
      prisma.fuelRequest.count({ where }),
    ])
  
    return { data, total }
  },

  /* ---------------------------------
     AGGREGATION (NEW)
     - for dashboard stats
  ---------------------------------- */
  aggregateStationRequests: async ({ where }: any) => {
    return prisma.fuelRequest.aggregate({
      where,
      _count: {
        _all: true,
      },
      _sum: {
        requestedLiters: true,
      },
    })
  },

  findById: async (id: string) => {
    return prisma.fuelRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            driverProfile: true,
            risks: {
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },

        vehicle: {
          include: {
            vehicleType: true,
            fuelType: true,
          },
        },

        station: true,
        fuelType: true,
        nozzle: true,
        rejectionReason: true,
        transaction: true,
      },
    });
  },

  

  currentFuelRequest: async ({
    operatorId,
    stationId,
  }: {
    operatorId: string;
    stationId: string;
  }) => {
    return prisma.fuelRequest.findFirst({
      where: {
        assignedToId: operatorId,
        stationId,
        status: {
          in: [
            FuelRequestStatus.VERIFIED,
            FuelRequestStatus.APPROVED,
            FuelRequestStatus.DISPENSING,
          ],
        },
      },
      include: {
        user: {
          include: {
            driverProfile: true,
            risks: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
        vehicle: {
          include: {
            vehicleType: true,
            fuelType: true,
          },
        },
        station: true,
        fuelType: true,
        nozzle: true,
        rejectionReason: true,
        transaction: true,
      },
    });
  },
}