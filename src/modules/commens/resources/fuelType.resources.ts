import { FuelType } from "@prisma/client";

export const FuelTypeResource = {
  toResponse(fuelType: FuelType) {
    return {
      id: fuelType.id,
      name: fuelType.name,
      price: fuelType.price,

      status: fuelType.status, // ✅ IMPORTANT ADDITION

      createdAt: fuelType.createdAt,
      updatedAt: fuelType.updatedAt,
    };
  },

  toResponseList(fuelTypes: FuelType[]) {
    return fuelTypes.map((item) => this.toResponse(item));
  },
};