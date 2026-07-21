import prisma from "../../../config/db";

export const FuelTypeRepository = {
  findAll: (params: {
    skip: number;
    take: number;
    status?: "ACTIVE" | "INACTIVE";
    search?: string;
  }) => {
    const { skip, take, status, search } = params;

    return prisma.fuelType.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },

      where: {
        ...(status && { status }),

        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      select: {
        id: true,
        name: true,
        price: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  count: (params: {
    status?: "ACTIVE" | "INACTIVE";
    search?: string;
  }) => {
    const { status, search } = params;

    return prisma.fuelType.count({
      where: {
        ...(status && { status }),

        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
    });
  },

  findByName: (name: string) =>
    prisma.fuelType.findFirst({
      where: { name },
    }),

  findById: (id: string) =>
    prisma.fuelType.findUnique({
      where: { id },
    }),

  create: (data: any) =>
    prisma.fuelType.create({ data }),

  update: (id: string, data: any) =>
    prisma.fuelType.update({
      where: { id },
      data,
    }),
};