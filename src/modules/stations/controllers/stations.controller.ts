import { Request, Response } from "express";
import { stationService } from "../services/stations.service";
import { createStationSchema } from "../../../schemas/stations.schema";
import { deleteFromFirebase, uploadToFirebase } from "../../../utils/storage";
import { stationRepository } from "../repositorys/stations.repository";
import { FuelConfigUpdateDTO, StationResource } from "../resources/stations.resource";
import prisma from "../../../config/db";
import { Prisma } from "@prisma/client";

type IdParams = {
  id: string;
};

const resolveImageUrl = async (file?: Express.Multer.File | undefined) => {
  if (!file) return null;

  // Example: replace with Firebase / Cloudinary
  // return await uploadToCloudinary(file);

  return `/uploads/images/${file.filename}`; // fallback local
};


export const getManagers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const take = Number(req.query.take) || 10
  const search = (req.query.search as string) || ""

  const result = await stationService.getManagers({
    page,
    take,
    search,
  })

  return res.json({
    success: true,
    message: "Managers fetched successfully",
    data: result.items,
    meta: {
      page,
      totalPages: result.totalPages,
    },
  })

}

// CREATE STATION

export const createStation = async (req: Request, res: Response) => {
  try {
    const parsed = createStationSchema.parse(req.body);

    const imageUrl = await resolveImageUrl(req.file);

    const payload = {
      ...parsed,
      lat: Number(parsed.lat),
      lng: Number(parsed.lng),
      imageUrl, // ✅ real value
    };

    const station = await stationService.createStation(payload);

    return res.status(201).json({
      success: true,
      message: "Station created successfully",
      data: station,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateStation = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const existing = await stationRepository.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    const parsed = createStationSchema.partial().parse(req.body);

    let imageUrl = existing.imageUrl;

    // ================= IMAGE REPLACEMENT =================
    if (req.file) {
      // optional: delete old image
      // if (existing.imageUrl) {
      //   await deleteFromStorage(existing.imageUrl);
      // }

      imageUrl = await resolveImageUrl(req.file);
    }

    const payload = {
      ...parsed,
      lat: parsed.lat ? Number(parsed.lat) : undefined,
      lng: parsed.lng ? Number(parsed.lng) : undefined,
      imageUrl,
    };

    const updated = await stationRepository.update(id, payload);

    return res.json({
      success: true,
      message: "Station updated successfully",
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL
export const getStations = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const take = Number(req.query.take) || 10;
    const search = (req.query.search as string) || "";

    const result = await stationService.getAllStations({
      page,
      take,
      search,
    });

    const formatted = StationResource.toResponseList(result.stations);

    return res.json({
      success: true,
      message: "Stations fetched successfully",
      data: formatted,
      meta: result.meta,
    });
};

// GET BY ID
export const getStationById = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const station = await stationService.getStationById(req.params.id);

    return res.json({
      success: true,
      message: "Station fetched successfully",
      data: station,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

export const assignManager = async (
  req: Request<IdParams>,
  res: Response
) => {
    const stationId = req.params.id;
    const { managerId } = req.body;

    if (!managerId) {
      const error: any = new Error("managerId is required");
      error.code = "MANAGER_ID_REQUIRED";
      error.statusCode = 400;
      throw error;
    }

    // 1️⃣ Check station exists
    const station = await stationRepository.findById(stationId);

    if (!station) {
      const error: any = new Error("Station not found");
      error.code = "STATION_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    // 2️⃣ Enforce uniqueness manually (better UX)
    const alreadyAssigned = await stationRepository.findByManagerId(managerId);

    if (alreadyAssigned && alreadyAssigned.id !== stationId) {
      const error: any = new Error(
        "Manager is already assigned to another station"
      );
      error.code = "MANAGER_ALREADY_ASSIGNED";
      error.statusCode = 409;
      throw error;
    }

    // 3️⃣ Update
    const updated = await stationRepository.update(stationId, {
      managerId,
    });

    return res.json({
      success: true,
      message: "Manager assigned successfully",
      data: updated,
    });
};


export const updateStationFuel = async (
  req: Request<IdParams>,
  res: Response
) => {
  const stationId = req.params.id
  const { fuelTypes } = req.body

  if (!Array.isArray(fuelTypes)) {
    const error: any = new Error("fuelTypes must be an array")
    error.code = "INVALID_FUEL_TYPES"
    error.statusCode = 400
    throw error
  }

  const station = await stationRepository.findById(stationId)

  if (!station) {
    const error: any = new Error("Station not found")
    error.code = "STATION_NOT_FOUND"
    error.statusCode = 404
    throw error
  }

  // optional: validate duplicates
  const seen = new Set()

  for (const f of fuelTypes) {
    if (seen.has(f.fuelTypeId)) {
      const error: any = new Error("Duplicate fuel type")
      error.code = "FUEL_DUPLICATE"
      error.statusCode = 409
      throw error
    }
    seen.add(f.fuelTypeId)
  }

  const updated = await stationRepository.updateFuelTypes(
    stationId,
    fuelTypes
  )

  return res.json({
    success: true,
    message: "Fuel configuration updated",
    data: updated,
  })
}

/* ---------------------------------------
   GET STATION FUEL TYPES
----------------------------------------*/
export const getStationFuelTypes = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const stationId = req.params.id
    

    if (!stationId) {
      return res.status(400).json({
        success: false,
        message: "stationId is required",
      })
    }

    const station =
      await stationRepository.findById(stationId)

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      })
    }

    const fuelTypes =
      await stationService.getStationFuelTypes(stationId)

    return res.json({
      success: true,
      message: "Station fuel types fetched successfully",
      data: fuelTypes,
    })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    })
  }
}

export const createTank = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const stationId = req.params.id
    const { stationFuelTypeId, name, capacity } = req.body

    if (!stationFuelTypeId || !name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "stationFuelTypeId, name, and capacity are required",
      })
    }

    // check station exists
    const station = await stationRepository.findById(stationId)

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      })
    }

    // create tank
    const tank = await stationService.createTank({
      stationId,
      stationFuelTypeId,
      name,
      capacity: Number(capacity),
    })

    return res.status(201).json({
      success: true,
      message: "Tank created successfully",
      data: tank,
    })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    })
  }
}


export const refillTank = async (req: Request, res: Response) => {
  const tankId = Array.isArray(req.params.tankId)
    ? req.params.tankId[0]
    : req.params.tankId

  const stationId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id

  const { amount } = req.body

  /* -------------------------
     VALIDATION
  --------------------------*/
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid refill amount is required",
    })
  }

  /* -------------------------
     VERIFY STATION
  --------------------------*/
  const station = await stationRepository.findById(stationId)

  if (!station) {
    return res.status(404).json({
      success: false,
      message: "Station not found",
    })
  }

  /* -------------------------
     FETCH CURRENT TANK STATE
  --------------------------*/
  const tank = await prisma.tank.findUnique({
    where: { id: tankId },
  })

  if (!tank) {
    return res.status(404).json({
      success: false,
      message: "Tank not found",
    })
  }

  const previousLevel = tank.currentLevel
  const newLevel = previousLevel + Number(amount)

  /* -------------------------
     UPDATE + AUDIT (BEST PRACTICE: SERVICE CAN ALSO DO THIS)
  --------------------------*/
  const result = await stationService.refillTank({
    tankId,
    amount: Number(amount),
  })

  await prisma.tankAuditLog.create({
    data: {
      tankId,
      action: "REFILL",
      litersChange: Number(amount),
      previousLevel,
      newLevel,
      reason: "REFILL",
      adjustmentType: null,
      referenceId: null,
      performedBy: (req as any).user?.id || "SYSTEM",
      performedRole: (req as any).user?.role || "ADMIN",
    },
  })

  /* -------------------------
     RESPONSE
  --------------------------*/
  return res.json({
    success: true,
    message: "Tank refilled successfully",
    data: result,
  })
}


export const adjustTankLevel = async (req: Request, res: Response) => {
  const tankId = Array.isArray(req.params.tankId)
    ? req.params.tankId[0]
    : req.params.tankId

  const stationId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id


  
  /* -------------------------
     VERIFY STATION
  --------------------------*/
  const station = await stationRepository.findById(stationId)

  if (!station) {
    return res.status(404).json({
      success: false,
      message: "Station not found",
    })
  }

  const { newLevel, reason, adjustmentType } = req.body

  /* ---------------------------------------
     VALIDATION
  ----------------------------------------*/
  if (newLevel === undefined || newLevel < 0) {
    return res.status(400).json({
      success: false,
      message: "Valid newLevel is required",
    })
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: "Reason is required",
    })
  }

  if (!adjustmentType) {
    return res.status(400).json({
      success: false,
      message: "Adjustment type is required",
    })
  }

  /* ---------------------------------------
     FIND TANK
  ----------------------------------------*/
  const tank = await prisma.tank.findUnique({
    where: { id: tankId },
  })

  if (!tank) {
    return res.status(404).json({
      success: false,
      message: "Tank not found",
    })
  }

  /* ---------------------------------------
     COMPUTE AUDIT VALUES (SERVER-SIDE)
  ----------------------------------------*/
  const previousLevel = tank.currentLevel
  const updatedLevel = Number(newLevel)

  const litersChange = updatedLevel - previousLevel

  /* ---------------------------------------
     UPDATE TANK
  ----------------------------------------*/
  const updatedTank = await prisma.tank.update({
    where: { id: tankId },
    data: {
      currentLevel: updatedLevel,
    },
  })

  /* ---------------------------------------
     CREATE AUDIT LOG
  ----------------------------------------*/
  await prisma.tankAuditLog.create({
    data: {
      tankId,
      action: "ADJUSTMENT",
      litersChange,
      previousLevel,
      newLevel: updatedLevel,
      reason,
      adjustmentType,
      referenceId: null,
      performedBy: (req as any).user?.id || "SYSTEM",
      performedRole: (req as any).user?.role || "ADMIN",
    },
  })

  /* ---------------------------------------
     RESPONSE
  ----------------------------------------*/
  return res.json({
    success: true,
    message: "Tank level adjusted successfully",
    data: updatedTank,
  })
}

export const getStationAuditLogs = async (req: Request, res: Response) => {
  const stationId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id

  /* -------------------------
     VERIFY STATION
  --------------------------*/
  const station = await stationRepository.findById(stationId)

  if (!station) {
    return res.status(404).json({
      success: false,
      message: "Station not found",
      data: null,
    })
  }

  /* -------------------------
     PAGINATION PARAMS
  --------------------------*/
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const skip = (page - 1) * limit

  /* -------------------------
     QUERY PARAMS
  --------------------------*/
  const {
    tankId,
    type,
    from,
    to,
    search,
  } = req.query as {
    tankId?: string
    type?: "REFILL" | "ADJUSTMENT"
    from?: string
    to?: string
    search?: string
  }

  /* -------------------------
     BUILD FILTER
  --------------------------*/
  const filters: any = {
    tank: {
      stationId,
    },
  }

  if (tankId) {
    filters.tankId = tankId
  }

  if (type) {
    filters.action = type
  }

  if (from || to) {
    filters.createdAt = {}

    if (from) filters.createdAt.gte = new Date(from)
    if (to) filters.createdAt.lte = new Date(to)
  }

  if (search) {
    filters.OR = [
      { reason: { contains: search, mode: "insensitive" } },
      { performedBy: { contains: search, mode: "insensitive" } },
      { performedRole: { contains: search, mode: "insensitive" } },
    ]
  }

  /* -------------------------
     TOTAL COUNT
  --------------------------*/
  const total = await prisma.tankAuditLog.count({
    where: filters,
  })

  /* -------------------------
     FETCH DATA
  --------------------------*/
  const logs = await prisma.tankAuditLog.findMany({
    where: filters,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tank: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  /* -------------------------
     RESPONSE META
  --------------------------*/
  const totalPages = Math.ceil(total / limit)

  return res.json({
    success: true,
    message: "Audit logs fetched successfully",
    data: logs,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  })
}


export const getDispensersByStation = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const stationId = req.params.id;

    const station = await stationRepository.findById(stationId);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    const dispensers =
      await stationRepository.findDispensersByStationId(stationId);

    return res.json({
      success: true,
      message: "Dispensers fetched successfully",
      data: dispensers,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const createDispenser = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const stationId = req.params.id
    const { number } = req.body

    // =========================
    // VALIDATION
    // =========================
    if (number === undefined || number === null) {
      return res.status(400).json({
        success: false,
        message: "Dispenser number is required",
      })
    }

    const parsedNumber = Number(number)

    if (Number.isNaN(parsedNumber)) {
      return res.status(400).json({
        success: false,
        message: "Dispenser number must be a valid number",
      })
    }

    // =========================
    // CHECK STATION EXISTS
    // =========================
    const station = await stationRepository.findById(stationId)

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      })
    }

    // =========================
    // DUPLICATION CHECK (IMPORTANT)
    // =========================
    const existing = await prisma.dispenser.findFirst({
      where: {
        stationId,
        number: parsedNumber,
      },
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Dispenser number ${parsedNumber} already exists in this station`,
      })
    }

    // =========================
    // CREATE DISPENSER
    // =========================
    const dispenser = await prisma.dispenser.create({
      data: {
        stationId,
        number: parsedNumber,
        status: "active",
      },
    })

    return res.status(201).json({
      success: true,
      message: "Dispenser created successfully",
      data: dispenser,
    })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    })
  }
}

export const toggleDispenserStatus = async (
  req: Request<{ id: string; dispenserId: string }>,
  res: Response
) => {
  try {
    const { id: stationId, dispenserId } = req.params;

    const station = await stationRepository.findById(stationId);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    const dispenser = await prisma.dispenser.findUnique({
      where: { id: dispenserId },
    });

    if (!dispenser) {
      return res.status(404).json({
        success: false,
        message: "Dispenser not found",
      });
    }

    const updated = await prisma.dispenser.update({
      where: { id: dispenserId },
      data: {
        status:
          dispenser.status === "active" ? "inactive" : "active",
      },
    });

    return res.json({
      success: true,
      message: "Dispenser status updated",
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const addNozzle = async (
  req: Request<{ id: string; pumpId: string }>,
  res: Response
) => {
  try {
    const stationId = req.params.id
    const dispenserId = req.params.pumpId
    const { number, fuelType } = req.body

    if (!number || !fuelType) {
      return res.status(400).json({
        success: false,
        message: "number and fuelType are required",
      })
    }

    const station = await stationRepository.findById(stationId)

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      })
    }

    const dispenser = await prisma.dispenser.findUnique({
      where: { id: dispenserId },
    })

    if (!dispenser) {
      return res.status(404).json({
        success: false,
        message: "Dispenser not found",
      })
    }

    // ======================================
    // 🔥 DUPLICATION CHECK (IMPORTANT)
    // ======================================
    const existingNozzle = await prisma.nozzle.findFirst({
      where: {
        dispenserId,
        number: Number(number),
      },
    })

    if (existingNozzle) {
      return res.status(409).json({
        success: false,
        message: `Nozzle number ${number} already exists for this dispenser`,
      })
    }

    // OPTIONAL: prevent duplicate fuel type per dispenser
    const duplicateFuelType = await prisma.nozzle.findFirst({
      where: {
        dispenserId,
        fuelType,
      },
    })

    if (duplicateFuelType) {
      return res.status(409).json({
        success: false,
        message: `Fuel type ${fuelType} already assigned to this dispenser`,
      })
    }

    // ======================================
    // CREATE NOZZLE
    // ======================================
    const nozzle = await prisma.nozzle.create({
      data: {
        dispenserId,
        number: Number(number),
        fuelType,
        status: "active",
      },
    })

    return res.status(201).json({
      success: true,
      message: "Nozzle added successfully",
      data: nozzle,
    })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    })
  }
}
export const toggleNozzleStatus = async (
  req: Request<{ id: string; dispenserId: string; nozzleId: string }>,
  res: Response
) => {
  try {
    const { id: stationId, nozzleId } = req.params;

    const station = await stationRepository.findById(stationId);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    const nozzle = await prisma.nozzle.findUnique({
      where: { id: nozzleId },
    });

    if (!nozzle) {
      return res.status(404).json({
        success: false,
        message: "Nozzle not found",
      });
    }

    const updated = await prisma.nozzle.update({
      where: { id: nozzleId },
      data: {
        status:
          nozzle.status === "active" ? "maintenance" : "active",
      },
    });

    return res.json({
      success: true,
      message: "Nozzle status updated",
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};


export const getStationNozzles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stationId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

    const fuelType =
      typeof req.query.fuelType === "string"
        ? req.query.fuelType
        : undefined;

    const page = Math.max(Number(req.query.page) || 1, 1);

    const perPage = Math.min(
      Math.max(Number(req.query.perPage) || 20, 1),
      100
    );

    const where: Prisma.NozzleWhereInput = {
      dispenser: {
        stationId,
      },

      ...(fuelType && {
        fuelType,
      }),
    };

    const [total, nozzles] = await prisma.$transaction([
      prisma.nozzle.count({
        where,
      }),

      prisma.nozzle.findMany({
        where,

        include: {
          dispenser: {
            select: {
              id: true,
              number: true,
              status: true,
              stationId: true,
            },
          },
        },

        skip: (page - 1) * perPage,
        take: perPage,

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: nozzles,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });

  } catch (error) {
    console.error("Get station nozzles:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch station nozzles.",
    });
  }
};

export const updateQueueZone = async (req: Request, res: Response) => {
  try {
    const stationId = Array.isArray(req.params.stationId)
      ? req.params.stationId[0]
      : req.params.stationId;

    const { queueZone } = req.body;

    if (!queueZone) {
      return res.status(400).json({
        success: false,
        message: "queueZone is required",
      });
    }

    const updated = await prisma.stationSetting.upsert({
      where: {
        stationId, // ✅ correct unique field (NOT id)
      },

      update: {
        queueZone,
      },

      create: {
        stationId, // ✅ correct relation key

        queueZone,

        // ✅ REQUIRED DEFAULTS (fix Prisma error)
        thresholdLow: 10,
        thresholdMedium: 25,
        thresholdHigh: 50,
        thresholdCritical: 80,

        maxQueueCapacity: 100,
        pricePerLiter: 0,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Queue zone updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update queue zone",
      error,
    });
  }
};


// station level controlle
export const getStationFuelConfig = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;

    const stationId =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
        ? rawId[0]
        : null;

    if (!stationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid station id",
        error: {
          code: "INVALID_STATION_ID",
        },
      });
    }

    const [fuelTypes, prices, system] = await Promise.all([
      prisma.stationFuelType.findMany({
        where: { stationId },
        include: { fuelType: true },
      }),

      prisma.stationFuelPrice.findMany({
        where: { stationId },
      }),

      prisma.systemSettings.findUnique({
        where: { id: "global" },
      }),
    ]);

    const priceControlMode = system?.priceControlMode ?? "FIXED";

    const merged = fuelTypes.map((ft) => {
      const stationPrice = prices.find(
        (p) => p.fuelTypeId === ft.fuelTypeId
      );

      const basePrice = ft.fuelType?.price;

      const finalPrice =
        stationPrice?.pricePerLiter ??
        basePrice ??
        0;

      const isOverrideAllowed =
        priceControlMode === "OVERRIDE" ||
        stationPrice?.isOverride === true;

      return {
        fuelTypeId: ft.fuelTypeId,

        fuelType: {
          id: ft.fuelType.id,
          name: ft.fuelType.name,
          price: ft.fuelType.price,
          status: ft.fuelType.status,
          createdAt: ft.fuelType.createdAt,
          updatedAt: ft.fuelType.updatedAt,
        },

        isActive: ft.isActive,

        min: ft.minRequestLiters,
        max: ft.maxRequestLiters,
        maxCapacity: ft.maxCapacity,

        // ✅ CLEAN PRICE RESOLUTION
        price: finalPrice,

        priceOverrideAllowed: isOverrideAllowed,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Fuel configuration fetched successfully",
      data: {
        stationId,
        priceControlMode,
        fuelTypes: merged,
      },
    });
  } catch (error) {
    console.error("getStationFuelConfig error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fuel configuration",
      error: {
        code: "INTERNAL_ERROR",
      },
    });
  }
};

export const updateStationFuelConfig = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;

const stationId =
  typeof rawId === "string"
    ? rawId
    : Array.isArray(rawId)
    ? rawId[0]
    : undefined;

if (!stationId) {
  return res.status(400).json({
    success: false,
    message: "Invalid station id",
  });
}

    const fuelTypes = req.body?.fuelTypes;

    if (!Array.isArray(fuelTypes)) {
      return res.status(400).json({
        success: false,
        message: "fuelTypes must be an array",
      });
    }

    if (fuelTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fuel configuration provided",
      });
    }

    const system = await prisma.systemSettings.findUnique({
      where: {
        id: "global",
      },
    });

    const priceControlMode =
      system?.priceControlMode ?? "FIXED";

    const allowPriceOverride =
      priceControlMode === "OVERRIDE";

    const updated: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const fuel of fuelTypes) {
        const fuelTypeId = fuel?.fuelTypeId;

        if (!fuelTypeId) continue;

        const minRequestLiters = Math.max(
          0,
          Number(fuel.min ?? 0)
        );

        const maxRequestLiters = Math.max(
          minRequestLiters,
          Number(fuel.max ?? minRequestLiters)
        );

        const maxCapacity = Math.max(
          0,
          Number(fuel.maxCapacity ?? 0)
        );

        const isActive = Boolean(fuel.isActive);

        // ==================================================
        // STATION FUEL TYPE
        // SAFE:
        // - NO DELETE
        // - NO DISCONNECT
        // - NO RELATION REPLACEMENT
        // ==================================================
        await tx.stationFuelType.upsert({
          where: {
            stationId_fuelTypeId: {
              stationId,
              fuelTypeId,
            },
          },

          update: {
            isActive,
            minRequestLiters,
            maxRequestLiters,
            maxCapacity,
          },

          create: {
            stationId,
            fuelTypeId,
            isActive,
            minRequestLiters,
            maxRequestLiters,
            maxCapacity,
          },
        });

        // ==================================================
        // STATION PRICE OVERRIDE
        // ==================================================
        if (
          allowPriceOverride &&
          Number.isFinite(Number(fuel.price))
        ) {
          await tx.stationFuelPrice.upsert({
            where: {
              stationId_fuelTypeId: {
                stationId,
                fuelTypeId,
              },
            },

            update: {
              pricePerLiter: Number(fuel.price),
              isOverride: true,
              effectiveFrom: new Date(),
            },

            create: {
              stationId,
              fuelTypeId,
              pricePerLiter: Number(fuel.price),
              isOverride: true,
            },
          });
        }

        updated.push(fuelTypeId);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Fuel configuration updated successfully",
      data: {
        stationId,
        updatedCount: updated.length,
        updatedFuelTypes: updated,
      },
    });
  } catch (error) {
    console.error(
      "updateStationFuelConfig error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update fuel configuration",
      error: {
        code: "INTERNAL_ERROR",
      },
    });
  }
};