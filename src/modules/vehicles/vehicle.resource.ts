export type VehicleResourceType = {
  id: string;

  // ================= CORE IDS =================
  userId: string;
  vehicleTypeId: string;
  fuelTypeId: string;

  // ================= LOCATION / PLATE SYSTEM =================
  regionCode: string; // ✅ ADD THIS (AA, OR, 3)

  // ================= DATA =================
  plateNumber: string;
  vin?: string | null;

  fuelCapacity: number;

  // ================= STATUS FLAGS =================
  isVerified: boolean;
  isActive: boolean;
  isDeleted?: boolean;

  // ================= RELATIONS =================
  vehicleType: {
    id: string;
    name: string;
    code: number; // Ethiopia classification (1–5)
    requiresBusinessLicense: boolean; // ✅ ADD THIS
  } | null;

  fuelType: {
    id: string;
    name: string;
  } | null;

  user?: {
    id: string;
    full_name: string;
    phone: string;
  };

  // ================= TIMESTAMPS =================
  createdAt: Date;
  updatedAt: Date;

  // ================= UI STATE =================
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "DELETED";
};

export const VehicleResource = {
  toResponse(vehicle: any): VehicleResourceType {
    const status =
      vehicle.isDeleted
        ? "DELETED"
        : vehicle.isActive
        ? vehicle.isVerified
          ? "ACTIVE"
          : "PENDING"
        : "INACTIVE";

    return {
      id: vehicle.id,

      userId: vehicle.userId,
      vehicleTypeId: vehicle.vehicleTypeId,
      fuelTypeId: vehicle.fuelTypeId,

      // ================= ADD REGION CODE =================
      regionCode: vehicle.regionCode,

      plateNumber: vehicle.plateNumber,
      vin: vehicle.vin ?? null,

      fuelCapacity: vehicle.fuelCapacity,

      isVerified: vehicle.isVerified,
      isActive: vehicle.isActive,
      isDeleted: vehicle.isDeleted ?? false,

      // ================= VEHICLE TYPE (WITH CODE) =================
      vehicleType: vehicle.vehicleType
      ? {
          id: vehicle.vehicleType.id,
          name: vehicle.vehicleType.name,
          code: vehicle.vehicleType.code,
          requiresBusinessLicense: vehicle.vehicleType.requiresBusinessLicense, // ✅ ADD
        }
      : null,

      fuelType: vehicle.fuelType
        ? {
            id: vehicle.fuelType.id,
            name: vehicle.fuelType.name,
          }
        : null,

      user: vehicle.user
        ? {
            id: vehicle.user.id,
            full_name: vehicle.user.full_name,
            phone: vehicle.user.phone,
          }
        : undefined,

      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,

      status,
    };
  },

  toResponseList(vehicles: any[]) {
    return vehicles.map((v) => this.toResponse(v));
  },
};