import { Request, Response } from "express"
import { approveFuelRequestService, cancelFuelRequestService, completeDispensingFuelRequestService, getCurrentFuelRequestService, getStationFuelRequestsService, startDispensingFuelRequestService, verifyFuelRequestService } from "../services/station-operator.service"
import { FuelRequestResource } from "../resources/station-operator.resource"
import { ApiResponse } from "../../../types/apiResponse"
import prisma from "../../../config/db"
import { RejectionReasonResource } from "../resources/rejectionReason.resource"
import { Prisma } from "@prisma/client"

export const getStationFuelRequests = async (
  req: Request,
  res: Response
): Promise<Response | void> => {

  // ==============================
  // 🔍 DEBUG: REQUEST INFO
  // ==============================
  console.log("📥 Incoming Request:", {
    url: req.originalUrl,
    method: req.method,
    query: req.query,
    headers: {
      authorization: req.headers.authorization
        ? "Bearer ***present***"
        : "MISSING",
    },
  })

  // ==============================
  // 🔍 DEBUG: AUTH USER
  // ==============================
  console.log("👤 req.user:", (req as any).user)

  // 🔐 station isolation
  const stationId = (req as any).user?.stationId

  console.log("🏢 stationId extracted:", stationId)

  if (!stationId) {
    console.log("❌ BLOCKED: Missing stationId in request context")

    return res.status(401).json({
      success: false,
      message: "Unauthorized: station context missing",
      data: null,
    } satisfies ApiResponse)
  }

  try {
    // ==============================
    // 📦 SERVICE CALL
    // ==============================
    const result = await getStationFuelRequestsService({
      stationId,
      query: req.query,
    })

    console.log("📦 Service result count:", result.data?.length)

    // ==============================
    // 🔄 TRANSFORM DATA
    // ==============================
    const data = result.data.map(FuelRequestResource)

    // ==============================
    // 📤 RESPONSE
    // ==============================
    const response: ApiResponse = {
      success: true,
      data,
      meta: result.pagination,
      summary: result.summary,
    }

    return res.status(200).json(response)

  } catch (error: any) {
    console.log("🔥 ERROR in getStationFuelRequests:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message,
    })
  }
}

export const getRejectionReasons = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const search = String(req.query.search || "");

    const skip = (page - 1) * limit;

    // ✅ TYPE-SAFE WHERE (THIS FIXES YOUR ERROR)
    const where: Prisma.RejectionReasonWhereInput = {
      isActive: true,
      ...(search
        ? {
            OR: [
              {
                label: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                code: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [reasons, total] = await Promise.all([
      prisma.rejectionReason.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: "asc" },
          { label: "asc" },
        ],
      }),

      prisma.rejectionReason.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Rejection reasons retrieved successfully",
      data: RejectionReasonResource.collection(reasons),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getRejectionReasons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rejection reasons",
    });
  }
};



export const verifyFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    const fuelRequestId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

    const user = (req as any).user;

    const result = await verifyFuelRequestService({
      fuelRequestId,
      operatorId: user.id,
      stationId: user.stationId,
    });

    return res.status(200).json({
      success: true,
      message: "Fuel request verified successfully.",
      data: FuelRequestResource(result),
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to verify fuel request.",
    });
  }
};

import { rejectFuelRequestService } from "../services/station-operator.service";

export const rejectFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fuelRequestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const user = (req as any).user;

    const { rejectionReasonId, rejectionNote } = req.body;

    if (!rejectionReasonId) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const result = await rejectFuelRequestService({
      fuelRequestId,
      operatorId: user.id,
      stationId: user.stationId,
      rejectionReasonId,
      rejectionNote,
    });

    return res.status(200).json({
      success: true,
      message: "Fuel request rejected successfully.",
      data: FuelRequestResource(result),
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to reject fuel request.",
    });
  }
};


import { getStationFuelRequestByIdService } from "../services/station-operator.service";

export const getStationFuelRequestById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fuelRequestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const user = (req as any).user;

    const fuelRequest = await getStationFuelRequestByIdService({
      fuelRequestId,
      stationId: user.stationId,
    });

    return res.status(200).json({
      success: true,
      data: FuelRequestResource(fuelRequest),
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve fuel request.",
    });
  }
};

export const getCurrentStationFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user;

    console.log("[DEBUG] Request context:", {
      userId: user.id,
      stationId: user.stationId,
    });

    const fuelRequest = await getCurrentFuelRequestService({
      operatorId: user.id,
      stationId: user.stationId,
    });

    console.log("[DEBUG] Fuel request result:", {
      exists: !!fuelRequest,
      id: fuelRequest?.id,
      status: fuelRequest?.status,
    });

    return res.status(200).json({
      success: true,
      message: fuelRequest
        ? "Current fuel request retrieved successfully."
        : "No active fuel request found.",
      data: fuelRequest ? FuelRequestResource(fuelRequest) : null,
    });
  } catch (error: any) {
    console.error("[ERROR] getCurrentStationFuelRequest:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve current fuel request.",
    });
  }
};

export const approveFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fuelRequestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const user = (req as any).user;

    const { approvedLiters, nozzleId } = req.body;

    if (approvedLiters == null) {
      return res.status(400).json({
        success: false,
        message: "Approved liters is required.",
      });
    }

    if (!nozzleId) {
      return res.status(400).json({
        success: false,
        message: "Nozzle is required.",
      });
    }

    const result = await approveFuelRequestService({
      fuelRequestId,
      operatorId: user.id,
      stationId: user.stationId,
      approvedLiters: Number(approvedLiters),
      nozzleId,
    });

    return res.status(200).json({
      success: true,
      message: "Fuel request approved successfully.",
      data: FuelRequestResource(result),
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to approve fuel request.",
    });
  }
};

export const cancelFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fuelRequestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const user = (req as any).user;

    const result = await cancelFuelRequestService({
      fuelRequestId,
      operatorId: user.id,
      stationId: user.stationId,
    });

    return res.status(200).json({
      success: true,
      message: "Fuel request cancelled successfully.",
      data: FuelRequestResource(result),
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to cancel fuel request.",
    });
  }
};

export const startDispensingFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fuelRequestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const user = (req as any).user;

    const result = await startDispensingFuelRequestService({
      fuelRequestId,
      operatorId: user.id,
      stationId: user.stationId,
    });

    return res.status(200).json({
      success: true,
      message: "Fuel dispensing started successfully.",
      data: FuelRequestResource(result),
    });

  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Failed to start fuel dispensing.",
    });
  }
};

export const completeDispensingFuelRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {

  try {

    const fuelRequestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;


    const user = (req as any).user;


    const { dispensedLiters } = req.body;


    if (dispensedLiters == null) {
      return res.status(400).json({
        success: false,
        message: "Dispensed liters is required.",
      });
    }


    const result =
      await completeDispensingFuelRequestService({
        fuelRequestId,
        operatorId: user.id,
        stationId: user.stationId,
        dispensedLiters: Number(dispensedLiters),
      });


    return res.status(200).json({
      success: true,
      message: "Fuel dispensing completed successfully.",
      data: FuelRequestResource(result),
    });


  } catch (error: any) {

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to complete fuel dispensing.",
    });

  }
};
