import prisma from "../../../config/db";

/* -----------------------------
   NORMALIZER (IMPORTANT)
------------------------------ */
const normalizeVehicleType = (v: any) => ({
  ...v,

  // ================= RULE ENGINE SAFETY =================
  maxLitersPerHour: v.maxLitersPerHour ?? 0,
  minRefillIntervalMinutes: v.minRefillIntervalMinutes ?? 60,
  maxRefillsPerDay: v.maxRefillsPerDay ?? 0,
  maxDailyLiters: v.maxDailyLiters ?? 0,
});

export const VehicleTypeRepository = {
  /* -----------------------------
     FIND ALL (PAGINATED)
  ------------------------------ */
  findAll: async ({
    skip,
    take,
    status,
    search,
  }: {
    skip: number;
    take: number;
    status?: "ACTIVE" | "INACTIVE";
    search?: string;
  }) => {
    const data = await prisma.vehicleType.findMany({
      skip,
      take,

      where: {
        AND: [
          status ? { status } : {},
          search
            ? {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              }
            : {},
        ],
      },

      include: {
        allowedFuelTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return data.map(normalizeVehicleType);
  },

  /* -----------------------------
     COUNT
  ------------------------------ */
  count: async ({
    status,
    search,
  }: {
    status?: "ACTIVE" | "INACTIVE";
    search?: string;
  }) => {
    return prisma.vehicleType.count({
      where: {
        AND: [
          status ? { status } : {},
          search
            ? {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              }
            : {},
        ],
      },
    });
  },

  /* -----------------------------
     FIND BY ID
  ------------------------------ */
  findById: async (id: string) => {
    const data = await prisma.vehicleType.findUnique({
      where: { id },
      include: {
        allowedFuelTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return data ? normalizeVehicleType(data) : null;
  },

  /* -----------------------------
     FIND BY NAME
  ------------------------------ */
  findByName: async (name: string) => {
    return prisma.vehicleType.findFirst({
      where: { name },
    });
  },

  /* -----------------------------
     CREATE
  ------------------------------ */
  create: async (data: any) => {
    const { fuelTypes, ...rest } = data;

    const result = await prisma.vehicleType.create({
      data: {
        ...rest,

        allowedFuelTypes: {
          connect: fuelTypes?.map((id: string) => ({ id })),
        },
      },

      include: {
        allowedFuelTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return normalizeVehicleType(result);
  },

  /* -----------------------------
     UPDATE
  ------------------------------ */
  update: async (id: string, data: any) => {
    const { fuelTypes, ...rest } = data;

    const result = await prisma.vehicleType.update({
      where: { id },

      data: {
        ...rest,

        allowedFuelTypes: fuelTypes
          ? {
              set: [],
              connect: fuelTypes.map((id: string) => ({ id })),
            }
          : undefined,
      },

      include: {
        allowedFuelTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return normalizeVehicleType(result);
  },

  /* -----------------------------
     UPDATE STATUS
  ------------------------------ */
  updateStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const result = await prisma.vehicleType.update({
      where: { id },
      data: { status },
      include: {
        allowedFuelTypes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return normalizeVehicleType(result);
  },
};