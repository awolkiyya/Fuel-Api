import { buildMeta } from "../../../utils/pagination";
import { VehicleTypeRepository } from "../repositorys/vehicleType.repository";

export const VehicleTypeService = {
  /* -----------------------------
     LIST
  ------------------------------ */
  list: async (
    page = 1,
    limit = 10,
    status?: "ACTIVE" | "INACTIVE",
    search?: string
  ) => {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      VehicleTypeRepository .findAll({
        skip,
        take: limit,
        status,
        search,
      }),
      VehicleTypeRepository.count({
        status,
        search,
      }),
    ]);

    return {
      items:items,
      meta: buildMeta(page, limit, total),
    };
  },

  /* -----------------------------
     CREATE
  ------------------------------ */
  create: async (data: any) => {
    const exists = await VehicleTypeRepository.findByName(data.name);

    if (exists) {
      const error: any = new Error("Vehicle type already exists");
      error.code = "VEHICLE_TYPE_EXISTS";
      error.statusCode = 409;
      throw error;
    }

    return await VehicleTypeRepository.create(data);
  },

  /* -----------------------------
     UPDATE
  ------------------------------ */
  update: async (id: string, data: any) => {
    const existing = await VehicleTypeRepository.findById(id);

    if (!existing) {
      const error: any = new Error("Vehicle type not found");
      error.code = "VEHICLE_TYPE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    // 🚨 duplicate name check (safe update)
    if (data.name) {
      const duplicate = await VehicleTypeRepository.findByName(data.name);

      if (duplicate && duplicate.id !== id) {
        const error: any = new Error("Vehicle type already exists");
        error.code = "VEHICLE_TYPE_EXISTS";
        error.statusCode = 409;
        throw error;
      }
    }

    return await VehicleTypeRepository.update(id, data);
  },

  /* -----------------------------
     STATUS UPDATE
  ------------------------------ */
  updateStatus: async (
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ) => {
    const existing = await VehicleTypeRepository.findById(id);

    if (!existing) {
      const error: any = new Error("Vehicle type not found");
      error.code = "VEHICLE_TYPE_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return await VehicleTypeRepository.update(id, { status });
  },
};