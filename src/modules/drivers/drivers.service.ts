import { buildMeta } from "../../utils/pagination"
import { driverRepository } from "./drivers.repository"

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
    const [drivers, total] = await Promise.all([
      driverRepository.findAll({
        skip,
        limit,
        search,
        status,
        riskLevel,
        vehicleFilter,
      }),
      driverRepository.count({
        search,
        status,
        riskLevel,
        vehicleFilter,
      }),
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