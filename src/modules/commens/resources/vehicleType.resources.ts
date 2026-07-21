type VehicleTypeWithFuel = {
  id: string;
  name: string;

  // ================= RULE ENGINE =================
  maxLitersPerHour: number;

  minRefillIntervalMinutes: number | null;

  maxRefillsPerDay?: number | null;

  maxDailyLiters?: number | null;

  description: string | null;

  status: string;

  createdAt: Date;
  updatedAt: Date;
  code:number;
  requiresBusinessLicense?:boolean;

  allowedFuelTypes?: {
    id: string;
    name: string;
  }[];
};
  
export const VehicleTypeResource = {
  toResponse(vehicleType: VehicleTypeWithFuel) {
    return {
      id: vehicleType.id,
      name: vehicleType.name,

      // ================= NEW CORE RULES =================
      maxLitersPerHour: vehicleType.maxLitersPerHour,
      minRefillIntervalMinutes: vehicleType.minRefillIntervalMinutes,
      maxRefillsPerDay: vehicleType.maxRefillsPerDay,

      // legacy (still exposed but optional)
      maxDailyLiters: vehicleType.maxDailyLiters,

      description: vehicleType.description,
      status: vehicleType.status,
      code:vehicleType.code,
      requiresBusinessLicense:vehicleType.requiresBusinessLicense,

      fuelTypes:
        vehicleType.allowedFuelTypes?.map((fuel) => ({
          id: fuel.id,
          name: fuel.name,
        })) || [],

      createdAt: vehicleType.createdAt,
      updatedAt: vehicleType.updatedAt,
    };
  },

  toResponseList(vehicleTypes: VehicleTypeWithFuel[]) {
    return vehicleTypes.map((item) => this.toResponse(item));
  },
};