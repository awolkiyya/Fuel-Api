import prisma from "../../config/db";
import {
  CreateVehicleDTO,
  UpdateVehicleDTO,
} from "./vehicles.types";

export const vehicleRepository = {

  // =====================================================
  // CREATE VEHICLE + OWNERSHIP DOCUMENT
  // =====================================================
  create: async (
    data: CreateVehicleDTO,
    documentUrl: string
  ) => {

    return prisma.$transaction(async (tx) => {

      const vehicle = await tx.vehicle.create({
        data: {
          userId: data.userId,
          vehicleTypeId: data.vehicleTypeId,
          fuelTypeId: data.fuelTypeId,
          regionCode: data.regionCode,
          plateNumber: data.plateNumber,
          vin: data.vin,
          fuelCapacity: data.fuelCapacity,

          ownershipDocument: {
            create: {
              documentUrl,
            },
          },
        },

        include: {
          vehicleType: true,
          fuelType: true,
          ownershipDocument: true,
        },
      });

      return vehicle;
    });
  },


  // =====================================================
  // FIND ALL
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
        isDeleted: false,
      },

      skip,
      take,

      orderBy: {
        createdAt: order,
      },

      include: {
        vehicleType: true,
        fuelType: true,
        ownershipDocument: true,
      },
    });
  },


  // =====================================================
  // COUNT
  // =====================================================
  count: async ({
    userId,
  }: {
    userId: string;
  }) => {

    return prisma.vehicle.count({
      where: {
        userId,
        isDeleted: false,
      },
    });
  },


  // =====================================================
  // FIND BY ID
  // =====================================================
  findById: async (
    id: string,
    userId?: string
  ) => {

    return prisma.vehicle.findFirst({
      where: {
        id,
        isDeleted: false,

        ...(userId
          ? {
              userId,
            }
          : {}),
      },

      include: {
        vehicleType: true,
        fuelType: true,
        ownershipDocument: true,
      },
    });
  },


  // =====================================================
  // FIND BY PLATE
  // =====================================================
  findByPlate: async (
    plateNumber: string,
    userId?: string
  ) => {

    return prisma.vehicle.findFirst({
      where: {
        plateNumber,
        isDeleted: false,

        ...(userId
          ? {
              userId,
            }
          : {}),
      },
    });
  },


  // =====================================================
  // FIND BY VIN
  // =====================================================
  findByVin: async (
    vin: string,
    userId?: string
  ) => {

    return prisma.vehicle.findFirst({
      where: {
        vin,
        isDeleted: false,

        ...(userId
          ? {
              userId,
            }
          : {}),
      },
    });
  },


  // =====================================================
  // FIND DUPLICATE
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

        OR: [
          {
            plateNumber,
          },
          {
            vin,
          },
        ],

        ...(userId
          ? {
              userId,
            }
          : {}),
      },
    });
  },


  // =====================================================
  // FIND USER VEHICLES
  // =====================================================
  findByUserId: async (
    userId: string
  ) => {

    return prisma.vehicle.findMany({
      where: {
        userId,
        isDeleted: false,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        vehicleType: true,
        fuelType: true,
        ownershipDocument: true,
      },
    });
  },


  // =====================================================
  // UPDATE VEHICLE
  // =====================================================
  update: async (
    id: string,
    data: UpdateVehicleDTO
  ) => {

    return prisma.vehicle.update({
      where: {
        id,
      },

      data,

      include: {
        vehicleType: true,
        fuelType: true,
        ownershipDocument: true,
      },
    });
  },


  // =====================================================
  // UPDATE OWNERSHIP DOCUMENT
  // =====================================================
  
  updateOwnershipDocument: async (
    vehicleId: string,
    documentUrl: string,
    ownershipNumber?: string
  ) => {
    return prisma.vehicleOwnershipDocument.upsert({
      where: {
        vehicleId,
      },
  
      // =================================================
      // CREATE
      // =================================================
  
      create: {
        vehicleId,
        documentUrl,
        ownershipNumber,
      },
  
      // =================================================
      // UPDATE
      // =================================================
  
      update: {
        documentUrl,
  
        // Only update ownership number when supplied.
        ...(ownershipNumber !== undefined
          ? {
              ownershipNumber,
            }
          : {}),
  
        // New document must be verified again.
        status: "PENDING",
  
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason: null,
      },
    });
  },
    

  // =====================================================
  // SOFT DELETE
  // =====================================================
  softDelete: async (
    id: string
  ) => {

    return prisma.vehicle.update({
      where: {
        id,
      },

      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  },


  // =====================================================
  // VEHICLE TYPE
  // =====================================================
  findVehicleTypeById: async (
    id: string
  ) => {

    return prisma.vehicleType.findUnique({
      where: {
        id,
      },

      include: {
        allowedFuelTypes: true,
      },
    });
  },


  // =====================================================
  // UPDATE STATUS
  // =====================================================
  updateStatus: async (
    id: string,
    data: {
      isActive?: boolean;
      isVerified?: boolean;
    }
  ) => {

    return prisma.vehicle.update({
      where: {
        id,
      },

      data,

      include: {
        vehicleType: true,
        fuelType: true,
        ownershipDocument: true,
      },
    });
  },
};