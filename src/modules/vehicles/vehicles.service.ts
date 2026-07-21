import { buildMeta } from "../../utils/pagination";
import { vehicleRepository } from "./vehicles.repository";
import { CreateVehicleDTO, UpdateVehicleDTO } from "./vehicles.types";

export const vehicleService = {
  // =====================================================
  // CREATE VEHICLE
  // =====================================================
  createVehicle: async (data: CreateVehicleDTO) => {
    const existing = await vehicleRepository.findDuplicate({
      plateNumber: data.plateNumber,
      vin: data.vin,
      userId: data.userId,
    });

    if (existing) {
      const error: any = new Error(
        "Vehicle already exists with this plate number or VIN"
      );
      error.code = "VEHICLE_ALREADY_EXISTS";
      error.statusCode = 409;
      throw error;
    }

    const vehicleType = await vehicleRepository.findVehicleTypeById(
      data.vehicleTypeId
    );

    if (!vehicleType) {
      const error: any = new Error("Invalid vehicle type");
      error.code = "INVALID_VEHICLE_TYPE";
      error.statusCode = 400;
      throw error;
    }

    const allowedFuelTypes = vehicleType.allowedFuelTypes ?? [];

    const isFuelAllowed = allowedFuelTypes.some(
      (f) => f.id === data.fuelTypeId
    );

    if (!isFuelAllowed) {
      const error: any = new Error(
        "Fuel type not allowed for this vehicle type"
      );
      error.code = "INVALID_FUEL_TYPE";
      error.statusCode = 400;
      throw error;
    }

    return vehicleRepository.create({
      ...data,
      plateNumber: data.plateNumber.toUpperCase().trim(),
    });
  },

  // =====================================================
  // GET ALL VEHICLES
  // =====================================================
  getAllVehicles: async ({
    userId,
    skip,
    take,
    page,
    order = "desc",
  }: {
    userId: string;
    skip: number;
    take: number;
    page: number;
    order?: "asc" | "desc";
  }) => {
    const [vehicles, total] = await Promise.all([
      vehicleRepository.findAll({
        userId,
        skip,
        take,
        order, // 👈 pass to repository
      }),
      vehicleRepository.count({
        userId,
      }),
    ]);
  
    return {
      vehicles,
      meta: buildMeta(page, take, total),
    };
  },

  // =====================================================
  // GET BY ID (SECURE OWNERSHIP FIX)
  // =====================================================
  getVehicleById: async (id: string, userId?: string) => {
    const vehicle = await vehicleRepository.findById(id);

    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.code = "VEHICLE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    // 🔥 SECURITY FIX (important)
    if (userId && vehicle.userId !== userId) {
      const error: any = new Error("Unauthorized access to vehicle");
      error.code = "UNAUTHORIZED_VEHICLE_ACCESS";
      error.statusCode = 403;
      throw error;
    }

    return vehicle;
  },

  // =====================================================
  // USER VEHICLES
  // =====================================================
  getUserVehicles: async (userId: string) => {
    return vehicleRepository.findByUserId(userId);
  },

  // =====================================================
  // UPDATE VEHICLE (SAFE + VALIDATION)
  // =====================================================
  updateVehicle: async (id: string, userId: string, data: UpdateVehicleDTO) => {
    const existing = await vehicleRepository.findById(id);

    if (!existing) {
      const error: any = new Error("Vehicle not found");
      error.code = "VEHICLE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    if (existing.userId !== userId) {
      const error: any = new Error("Unauthorized update attempt");
      error.code = "UNAUTHORIZED_VEHICLE_UPDATE";
      error.statusCode = 403;
      throw error;
    }

    return vehicleRepository.update(id, data);
  },

  // =====================================================
  // DELETE VEHICLE (SAFE)
  // =====================================================
  deleteVehicle: async (id: string, userId: string) => {
    const vehicle = await vehicleRepository.findById(id);
  
    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.code = "VEHICLE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }
  
    if (vehicle.userId !== userId) {
      const error: any = new Error("Unauthorized delete attempt");
      error.code = "UNAUTHORIZED_VEHICLE_DELETE";
      error.statusCode = 403;
      throw error;
    }
  
    // 🚫 BUSINESS RULE: verified vehicles cannot be deleted
    if (vehicle.isVerified === true) {
      const error: any = new Error(
        "Verified vehicles cannot be deleted"
      );
      error.code = "VERIFIED_VEHICLE_DELETE_BLOCKED";
      error.statusCode = 409;
      throw error;
    }
  
    return vehicleRepository.softDelete(id);
  },

  deactivateVehicle: async (id: string, userId: string) => {
    const vehicle = await vehicleRepository.findById(id, userId);
  
    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.code = "VEHICLE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }
  
    // 🚫 prevent action on deleted vehicle
    if (vehicle.isDeleted) {
      const error: any = new Error("Vehicle is deleted");
      error.code = "VEHICLE_ALREADY_DELETED";
      error.statusCode = 400;
      throw error;
    }
  
    // 🚫 prevent redundant operation
    if (!vehicle.isActive) {
      const error: any = new Error("Vehicle already deactivated");
      error.code = "VEHICLE_ALREADY_INACTIVE";
      error.statusCode = 409;
      throw error;
    }
  
    return vehicleRepository.updateStatus(id, {
      isActive: false,
    });
  },

  activateVehicle: async (id: string, userId: string) => {
    const vehicle = await vehicleRepository.findById(id, userId);
  
    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.code = "VEHICLE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }
  
    if (vehicle.isDeleted) {
      const error: any = new Error("Vehicle is deleted");
      error.code = "VEHICLE_ALREADY_DELETED";
      error.statusCode = 400;
      throw error;
    }
  
    if (vehicle.isActive) {
      const error: any = new Error("Vehicle already active");
      error.code = "VEHICLE_ALREADY_ACTIVE";
      error.statusCode = 409;
      throw error;
    }
  
    return vehicleRepository.updateStatus(id, {
      isActive: true,
    });
  },
};