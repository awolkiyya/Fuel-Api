import { Request, Response } from "express";
import prisma from "../../../config/db";
import { normalizeParam } from "../../../utils/nortmilizer";
import { getSystemSettings } from "../../../utils/getSystemSettings";
import { resolveFuelPrice } from "../../../rules/pricing.rules";
import { createFuelRequestSchema } from "../../../schemas/fuelRequests.schema";
import { calculateDistance, Coordinates } from "../../../utils/distance";
import { fuelRequestService } from "../../fuelRequests/fuelRequests.service";

/**
 * =====================================================
 * CREATE FUEL REQUEST (CONTROLLER - THIN LAYER)
 * =====================================================
 */
export const createFuelRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Validate payload
    const payload = createFuelRequestSchema.parse(req.body);

    // 2. Build coordinates
    const userCoords: Coordinates = {
      lat: Number(payload.lat),
      lng: Number(payload.long),
    };

    // 3. Delegate distance calculation dependency (station fetched inside service OR here is ok, but better service)
    const distanceKm = await fuelRequestService.calculateDistanceToStation(
      payload.stationId,
      userCoords
    );

    // 4. Call service (ALL BUSINESS LOGIC INSIDE)
    const result = await fuelRequestService.createRequest(
      userId,
      payload,
      distanceKm
    );

    return res.status(201).json({
      success: true,
      message: "Fuel request processed",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to process fuel request",
    });
  }
};



/**
 * =====================================================
 * GET MY FUEL REQUESTS (PRODUCTION READY)
 * =====================================================
 */
export const getMyFuelRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // 📄 PAGINATION
    // =========================
    const page = Math.max(
      1,
      parseInt(req.query.page as string) || 1
    );

    const limit = Math.min(
      50,
      parseInt(req.query.limit as string) || 10
    );

    const skip = (page - 1) * limit;

    // =========================
    // 🎯 FILTER
    // =========================
    const status = req.query.status as string;

    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status;
    }

    // =========================
    // ⚙️ SYSTEM SETTINGS (CACHED)
    // =========================
    const settings = await getSystemSettings(prisma);

    // =========================
    // 📦 DATA FETCH (OPTIMIZED)
    // =========================
    const [requests, total] = await Promise.all([
      prisma.fuelRequest.findMany({
        where: whereClause,
        include: {
          vehicle: {
            include: {
              vehicleType: true,
              fuelType: true,
            },
          },
          station: true,
          fuelType: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.fuelRequest.count({
        where: whereClause,
      }),
    ]);

    // =========================
    // 🚀 STATION PRICING BATCH (NO N+1 QUERY)
    // =========================
    const stationIds = [...new Set(requests.map(r => r.station.id))];

    const stationPrices = await prisma.stationFuelPrice.findMany({
      where: {
        stationId: { in: stationIds },
      },
    });

    // =========================
    // 🧠 SMART MAPPING (SYNC - FIXED)
    // =========================
    const data = requests.map((r) => {
      const stationPrice = stationPrices.find(
        (p) =>
          p.stationId === r.station.id &&
          p.fuelTypeId === r.fuelType.id
      );

      const pricePerLiter = resolveFuelPrice(
        r.fuelType,
        stationPrice
          ? {
              fuelTypeId: stationPrice.fuelTypeId,
              pricePerLiter: stationPrice.pricePerLiter,
              isOverride: stationPrice.isOverride,
            }
          : {
              fuelTypeId: r.fuelType.id,
              pricePerLiter: r.fuelType.price,
              isOverride: false,
            },
        settings
      );

      const totalPrice =
        r.requestedLiters * pricePerLiter;

      return {
        id: r.id,

        vehicle: {
          name: r.vehicle.vehicleType.name,
          fuelType: r.vehicle.fuelType.name,
        },

        station: {
          name: r.station.name,
        },

        request: {
          requestedLiters: r.requestedLiters,
          pricePerLiter,
          totalPrice,
          status: r.status,
        },

        dateTime: r.createdAt,
      };
    });

    // =========================
    // 📤 RESPONSE
    // =========================
    return res.json({
      success: true,

      data,

      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch fuel requests",
    });
  }
};
/**
 * =====================================================
 * GET ACTIVE FUEL REQUEST ONLY
 * =====================================================
 */
export const getMyActiveFuelRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activeRequests = await prisma.fuelRequest.findMany({
      where: {
        userId,
        status: {
          in: ["PENDING", "APPROVED","VERIFIED"],
        },
      },
      include: {
        vehicle: true,
        station: true,
        fuelType: true,
        assignedTo: true,
        nozzle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: activeRequests, // always array
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active requests",
    });
  }
};


/**
 * =====================================================
 * GET FUEL REQUEST BY ID
 * =====================================================
 */
export const getFuelRequestById = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const id = normalizeParam(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const request = await prisma.fuelRequest.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        vehicle: {
          include: {
            fuelType: true,
          },
        },
        station: true,
        fuelType: true,
        assignedTo: true,
        nozzle: true,
        rejectionReason: true,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Fuel request not found",
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get fuel request",
    });
  }
};


export const cancelFuelRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const id = normalizeParam(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("CANCEL REQUEST ID:", id);
    console.log("USER ID:", userId);

    /**
     * 1. Fetch request first (more reliable than updateMany)
     */
    const request = await prisma.fuelRequest.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Fuel request not found",
      });
    }

    /**
     * 2. Validate status explicitly (better debugging)
     */
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request in '${request.status}' state`,
      });
    }

    /**
     * 3. Perform update
     */
    const updated = await prisma.fuelRequest.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Fuel request cancelled successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("cancelFuelRequest error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel fuel request",
    });
  }
};