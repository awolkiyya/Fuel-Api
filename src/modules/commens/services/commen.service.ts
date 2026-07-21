import { buildMeta } from "../../../utils/pagination";
import { FuelTypeRepository } from "../repositorys/fuelType.repository";

export const FuelTypeService = {
  list: async (
    page = 1,
    limit = 10,
    status?: "ACTIVE" | "INACTIVE",
    search?: string
  ) => {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      FuelTypeRepository.findAll({
        skip,
        take: limit,
        status,
        search,
      }),
      FuelTypeRepository.count({
        status,
        search,
      }),
    ]);

    return {
      items,
      meta: buildMeta(page, limit, total),
    };
  },

  create: async (data: any) => {
    const exists = await FuelTypeRepository.findByName(data.name);
  
    if (exists) {
      const error: any = new Error("Fuel type already exists");
      error.code = "FUEL_ALREADY_EXISTS";
      error.statusCode = 409;
      throw error;
    }
  
    return await FuelTypeRepository.create(data);
  },

  update: async (id: string, data: any) => {
    const existing = await FuelTypeRepository.findById(id);
  
    if (!existing) {
      const error: any = new Error("Fuel type not found");
      error.code = "FUEL_NOT_EXISTS";
      error.statusCode = 404;
      throw error;
    }
  
    // 🚨 check duplicate name (important for update)
    if (data.name) {
      const duplicate = await FuelTypeRepository.findByName(data.name);
  
      // allow same record to keep its own name
      if (duplicate && duplicate.id !== id) {
        const error: any = new Error("Fuel type already exists");
        error.code = "FUEL_ALREADY_EXISTS";
        error.statusCode = 409;
        throw error;
      }
    }
  
    return await FuelTypeRepository.update(id, data);
  },

  updateStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const existing = await FuelTypeRepository.findById(id);
  
    if (!existing) {
      const error: any = new Error("Fuel type not found");
      error.code = "FUEL_NOT_EXISTS";
      error.statusCode = 404;
      throw error;
    }
  
    return await FuelTypeRepository.update(id, { status });
  },
};