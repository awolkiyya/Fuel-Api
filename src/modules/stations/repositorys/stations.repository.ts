import prisma from "../../../config/db";
import { CreateStationDTO, UpdateStationDTO } from "../stations.types";

export const stationRepository = {

  // =====================================================
  // CREATE
  // =====================================================
  create: async (data: CreateStationDTO) => {
    return prisma.station.create({
      data,
    });
  },

  // =====================================================
  // FIND ALL (PAGINATED)
  // =====================================================
  findAll: async ({
    skip,
    take,
    search,
    order,
  }: {
    skip: number;
    take: number;
    search?: string;
    order?: "asc" | "desc";
  }) => {
    return prisma.station.findMany({
      skip,
      take,
  
      orderBy: {
        createdAt: order ?? "desc",
      },
  
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
  
      include: {
        manager: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
  
        fuelTypes: {
          select: {
            id: true,
            maxCapacity: true,
            isActive:true,
            fuelType: {
              select: {
                id: true,
                name: true,
              },
            },
            tanks: {
              select: {
                currentLevel: true,
              },
            },
          },
        },
  
        cameras: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            streamUrl: true,
            type: true,
            location: true,
            status: true,
          },
        },
  
        settings: true,
        traffic: true,
      },
    });
  },
  // =====================================================
  // COUNT (FOR PAGINATION)
  // =====================================================
  count: async ({
    search,
  }: {
    search?: string;
  }) => {
    return prisma.station.count({
      where: {

        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    });
  },

  // =====================================================
  // FIND BY ID
  // =====================================================
  findById: async (id: string) => {
    return prisma.station.findUnique({
      where: { id },

      include: {
        manager: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },

        fuelTypes: {
          where: {
            isActive: true,
          },
          include: {
            fuelType: true,
          },
        },

        cameras: {
          where: {
            isActive: true,
          },
        },

        settings: true,
        traffic: true,
      },
    });
  },

  // =====================================================
  // UPDATE
  // =====================================================
  update: async (id: string, data: UpdateStationDTO) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== undefined
      )
    )
  
    return prisma.station.update({
      where: { id },
      data: cleanData,
    })
  },

  async updateFuelTypes(stationId: string, fuelTypes: any[]) {
    return prisma.station.update({
      where: { id: stationId },
      data: {
        fuelTypes: {
          deleteMany: {}, // remove old config
  
          create: fuelTypes.map((f) => ({
            fuelTypeId: f.fuelTypeId,
            maxCapacity: f.maxCapacity,
            isActive: f.isActive ?? true,
          })),
        },
      },
      include: {
        fuelTypes: true,
      },
    })
  },
    // =====================================================
  // FIND MANAGERS (PAGINATED)
  // =====================================================
  findManagers: async ({
    skip,
    take,
    where,
  }: {
    skip: number
    take: number
    where?: any
  }) => {
    return prisma.user.findMany({
      skip,
      take,

      where: {
        ...where,
        role: "station_manager", // 🔥 important filter
      },

      select: {
        id: true,
        full_name: true,
        phone: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    })
  },

  countManagers: async ({
    where,
  }: {
    where?: any
  }) => {
    return prisma.user.count({
      where: {
        ...where,
        role: "station_manager",
      },
    })
  },
  findByManagerId: async (managerId: string) => {
    return prisma.station.findFirst({
      where: { managerId },
    });
  },

  /* ---------------------------------------
     GET STATION FUEL TYPES (CORE QUERY)
  ----------------------------------------*/
  findFuelTypesByStationId: async (stationId: string) => {
    return prisma.stationFuelType.findMany({
      where: {
        stationId,
        deletedAt: null,
        isActive: true,
      },
  
      include: {
        fuelType: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
  
        tanks: {
          select: {
            id: true,
            name: true,
            capacity: true,
            currentLevel: true,
            status: true,
          },
        },
      },
    })
  },

  // =========================
  // CREATE TANK
  // =========================
  createTank: async (data: {
    stationFuelTypeId: string
    stationId: string
    name: string
    capacity: number
  }) => {
    return prisma.tank.create({
      data: {
        stationFuelTypeId: data.stationFuelTypeId,
        stationId: data.stationId, // ✅ REQUIRED
        name: data.name,
        capacity: data.capacity,
        currentLevel: 0,
        status: "ACTIVE", // ✅ REQUIRED
      },
    })
  },

  updateTank: async (
    id: string,
    data: {
      currentLevel?: number
      name?: string
      capacity?: number
      status?: string
    }
  ) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== undefined
      )
    )
  
    return prisma.tank.update({
      where: { id },
      data: cleanData,
    })
  },

  // =========================
  // REFILL TANK
  // =========================
  refill: async (tankId: string, amount: number) => {
    return prisma.tank.update({
      where: { id: tankId },
      data: {
        currentLevel: {
          increment: amount,
        },
      },
    })
  },

  // =========================
  // GET TANK BY ID
  // =========================
  findTankById: async (id: string) => {
    return prisma.tank.findUnique({
      where: { id },
    })
  },

  findTankByName: async (stationId: string, name: string) => {
    return prisma.tank.findFirst({
      where: {
        stationId,
        name: {
          equals: name,
          mode: "insensitive", // 🔥 prevents "Tank A" vs "tank a"
        },
      },
    })
  },

  findDispensersByStationId: async (stationId: string) => {
    return prisma.dispenser.findMany({
      where: { stationId },
      include: {
        nozzles: true,
      },
    })
  }

  // =====================================================
  // DELETE (SOFT DELETE RECOMMENDED)
  // =====================================================
  // delete: async (id: string) => {
  //   return prisma.station.update({
  //     where: { id },
  //     data: {
  //       isActive: false,
  //     },
  //   });
  // },
};