import prisma from "../../config/db";
import { CreateVehicleDTO, UpdateVehicleDTO } from "./vehicles.types";

export const vehicleRepository = {
  // =====================================================
  // CREATE
  // =====================================================
  create: async (data: CreateVehicleDTO) => {
    return prisma.vehicle.create({
      data,
      include: {
        vehicleType: true,
        fuelType: true,
      },
    });
  },

  // =====================================================
  // FIND ALL (USER SCOPED + PAGINATED)
  // =====================================================
  findAll: async ({
    userId,
    skip,
    take,
    order = "desc",
  }: {
    userId: string;
    skip: number;
    take: number;
    order?: "asc" | "desc";
  }) => {
    return prisma.vehicle.findMany({
      where: {
        userId,
        isDeleted: false, // 🔥 important soft delete filter
      },
  
      skip,
      take,
  
      orderBy: {
        createdAt: order,
      },
  
      include: {
        vehicleType: true,
        fuelType: true,
      },
    });
  },

  // =====================================================
  // COUNT (USER SCOPED)
  // =====================================================
  count: async ({ userId }: { userId: string }) => {
    return prisma.vehicle.count({
      where: {
        userId,
        isDeleted: false, // 🔥 IMPORTANT
      },
    });
  },

  // =====================================================
  // FIND BY ID (USER SAFE + SOFT DELETE SAFE)
  // =====================================================
  findById: async (id: string, userId?: string) => {
    return prisma.vehicle.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(userId ? { userId } : {}),
      },
      include: {
        vehicleType: true,
        fuelType: true,
      },
    });
  },

  // =====================================================
  // FIND BY PLATE
  // =====================================================
  findByPlate: async (plateNumber: string, userId?: string) => {
    return prisma.vehicle.findFirst({
      where: {
        plateNumber,
        isDeleted: false,
        ...(userId ? { userId } : {}),
      },
    });
  },

  // =====================================================
  // FIND BY VIN
  // =====================================================
  findByVin: async (vin: string, userId?: string) => {
    return prisma.vehicle.findFirst({
      where: {
        vin,
        isDeleted: false,
        ...(userId ? { userId } : {}),
      },
    });
  },

  // =====================================================
  // FIND DUPLICATE (STRONG SAFETY CHECK)
  // =====================================================
  findDuplicate: async ({
    plateNumber,
    vin,
    userId,
  }: {
    plateNumber: string;
    vin: string;
    userId?: string;
  }) => {
    return prisma.vehicle.findFirst({
      where: {
        isDeleted: false,
        OR: [{ plateNumber }, { vin }],
        ...(userId ? { userId } : {}),
      },
    });
  },

  // =====================================================
  // FIND BY USER
  // =====================================================
  findByUserId: async (userId: string) => {
    return prisma.vehicle.findMany({
      where: {
        userId,
        isDeleted: false, // 🔥 IMPORTANT
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicleType: true,
        fuelType: true,
      },
    });
  },

  // =====================================================
  // UPDATE
  // =====================================================
  update: async (id: string, data: UpdateVehicleDTO) => {
    return prisma.vehicle.update({
      where: { id },
      data,
      include: {
        vehicleType: true,
        fuelType: true,
      },
    });
  },

  // =====================================================
  // SOFT DELETE (REPLACES HARD DELETE)
  // =====================================================
  softDelete: async (id: string) => {
    return prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  },

  // =====================================================
  // FIND VEHICLE TYPE BY ID
  // =====================================================
  findVehicleTypeById: async (id: string) => {
    return prisma.vehicleType.findUnique({
      where: { id },
      include: {
        allowedFuelTypes: true,
      },
    });
  },

  updateStatus: async (
    id: string,
    data: { isActive?: boolean; isVerified?: boolean }
  ) => {
    return prisma.vehicle.update({
      where: { id },
      data,
      include: {
        vehicleType: true,
        fuelType: true,
      },
    });
  },
};