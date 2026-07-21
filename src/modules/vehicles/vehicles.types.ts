import type { VehicleType } from "@prisma/client";

export type CreateVehicleDTO = {
  userId: string;
  vehicleTypeId: string;
  plateNumber: string;
  regionCode: string;
  fuelCapacity: number;
  vin:string;
  fuelTypeId:string;
};

export type UpdateVehicleDTO = Partial<CreateVehicleDTO>;

export type VehicleResponse = {
  id: string;
  userId: string;
  vehicleTypeId: string;
  regionCode: string;
  plateNumber: string;
  fuelCapacity: number;
  isVerified: boolean;
  vehicleType?: VehicleType;
};