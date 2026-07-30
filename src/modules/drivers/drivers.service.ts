import { buildMeta } from "../../utils/pagination"
import { buildDriverWhere, driverRepository } from "./drivers.repository"

export const driverService = {
  // GET ALL DRIVERS
  getAllDrivers: async ({
    page,
    limit,
    skip,
    search,
    status,
    riskLevel,
    vehicleFilter,
  }: any) => {
    // Resolved ONCE here and shared by both findAll and count, so a
    // risk/vehicle filter no longer triggers its resolver query twice
    // per request.
    const where = await buildDriverWhere({
      search,
      status,
      riskLevel,
      vehicleFilter,
    })

    const [drivers, total] = await Promise.all([
      driverRepository.findAll({ where, skip, limit }),
      driverRepository.count({ where }),
    ])

    return {
      data: drivers,
      meta: buildMeta(page, limit, total),
    }
  },

  // GET DRIVER BY ID
  getDriverById: async (id: string) => {
    return driverRepository.findById(id)
  },
}