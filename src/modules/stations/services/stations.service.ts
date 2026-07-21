import { buildMeta } from "../../../utils/pagination";
import { stationRepository } from "../repositorys/stations.repository";
import { CreateStationDTO, UpdateStationDTO } from "../stations.types";

export const stationService = {
  createStation: async (data: CreateStationDTO) => {
    return stationRepository.create(data);
  },

 // =====================================================
// GET ALL STATIONS
// =====================================================
getAllStations: async ({
  page,
  take,
  search,
  order = "desc",
}: {
  page: number;
  take: number;
  search?: string;
  order?: "asc" | "desc";
}) => {
  const skip = (page - 1) * take;

  const [stations, total] = await Promise.all([
    stationRepository.findAll({
      skip,
      take,
      search,
      order,
    }),
    stationRepository.count({
      search,
    }),
  ]);

  return {
    stations,
    meta: buildMeta(page, take, total),
  };
},

  getStationById: async (id: string) => {
    const station = await stationRepository.findById(id);

    if (!station) {
      throw new Error("Station not found");
    }

    return station;
  },

  updateStation: async (id: string, data: UpdateStationDTO) => {
    return stationRepository.update(id, data);
  },

  // deleteStation: async (id: string) => {
  //   return stationRepository.delete(id);
  // },

  getManagers: async ({
    page,
    take,
    search,
  }: {
    page: number
    take: number
    search?: string
  }) => {
    const skip = (page - 1) * take
  
    const where = search
      ? {
          OR: [
            {
              full_name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: search,
              },
            },
          ],
        }
      : {}
  
    const [managers, total] = await Promise.all([
      stationRepository.findManagers({
        skip,
        take,
        where,
      }),
      stationRepository.countManagers({
        where,
      }),
    ])
  
    return {
      items: managers,
      totalPages: Math.ceil(total / take),
    }
  },
  getStationFuelTypes: async (stationId: string) => {
    const data =
      await stationRepository.findFuelTypesByStationId(stationId)
  
    return data.map((item) => {
      
      // ============================
      // 1. TOTAL TANK CAPACITY USED
      // ============================
      const allocatedCapacity = item.tanks.reduce(
        (sum, t) => sum + (t.capacity ?? 0),
        0
      )
  
      // ============================
      // 2. STATION LIMIT (FUEL TYPE RULE)
      // ============================
      const maxCapacity = item.maxCapacity ?? 0
  
      // ============================
      // 3. REMAINING FOR NEW TANKS
      // ============================
      const remaining = Math.max(
        maxCapacity - allocatedCapacity,
        0
      )
  
      // ============================
      // 4. CURRENT FUEL (OPTIONAL INFO ONLY)
      // ============================
      const currentFuel = item.tanks.reduce(
        (sum, t) => sum + (t.currentLevel ?? 0),
        0
      )
  
      const utilization =
        maxCapacity > 0
          ? Math.round((currentFuel / maxCapacity) * 100)
          : 0
  
      return {
        id: item.id,
  
        fuelType: {
          id: item.fuelType.id,
          name: item.fuelType.name,
          price: item.fuelType.price,
        },
  
        // 🔥 CORE STORAGE LOGIC (WHAT YOU WANT)
        maxCapacity,
        allocatedCapacity,
        remaining,
  
        // 🔥 OPTIONAL OPERATION METRICS
        currentFuel,
        utilization,
  
        tanks: item.tanks,
      }
    })
  },

  createTank: async ({
    stationId,
    stationFuelTypeId,
    name,
    capacity,
  }: {
    stationId: string
    stationFuelTypeId: string
    name: string
    capacity: number
  }) => {
  
    // ===============================
    // 1. CHECK FUEL TYPE
    // ===============================
    const fuelTypes =
      await stationRepository.findFuelTypesByStationId(stationId)
  
    const fuel = fuelTypes.find((f) => f.id === stationFuelTypeId)
  
    if (!fuel) {
      throw new Error("Fuel type not found for this station")
    }
  
    // ===============================
    // 2. CHECK DUPLICATE NAME
    // ===============================
    const existingTank =
      await stationRepository.findTankByName(stationId, name)
  
    if (existingTank) {
      throw new Error(
        `Tank name "${name}" already exists in this station`
      )    }
  
    // ===============================
    // 3. CAPACITY CHECK
    // ===============================
    const allocated = fuel.tanks.reduce(
      (sum, t) => sum + (t.capacity ?? 0),
      0
    )
  
    const remaining = fuel.maxCapacity - allocated
  
    if (capacity > remaining) {
      throw new Error("Not enough remaining capacity")
    }
  
    // ===============================
    // 4. CREATE TANK
    // ===============================
    return stationRepository.createTank({
      stationId,
      stationFuelTypeId,
      name,
      capacity,
    })
  },

  refillTank: async ({
    tankId,
    amount,
  }: {
    tankId: string
    amount: number
  }) => {
    const tank = await stationRepository.findTankById(tankId)
  
    if (!tank) {
      throw new Error("Tank not found")
    }
  
    const currentLevel = tank.currentLevel ?? 0
  
    const capacity = tank.capacity
  
    const newLevel = currentLevel + amount
  
    // 1. safety check
    if (newLevel > capacity) {
      throw new Error(
        `Refill exceeds tank capacity (${capacity}L)`
      )
    }
  
    // 2. update tank
    return stationRepository.updateTank(tankId, {
      currentLevel: newLevel,
    })
  },

  getPumpsByStation: async (stationId: string) => {
    const data = await stationRepository.findDispensersByStationId(stationId)
  
    return data
  },

  
};