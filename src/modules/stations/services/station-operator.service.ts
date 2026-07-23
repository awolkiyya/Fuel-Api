import { fuelRequestRepository } from "../repositorys/station-operator.repository"


export const getStationFuelRequestsService = async ({
  stationId,
  query,
}: any) => {
  const {
    page = 1,
    limit = 20,
    search,
    fuelTypeId,
    vehicleType,
    status,
    sort = "desc",
  } = query

  const skip = (Number(page) - 1) * Number(limit)

  /* ---------------------------------
     BASE FILTER
  ---------------------------------- */
  const where: any = {
    stationId,
  }

  if (fuelTypeId) {
    where.fuelTypeId = fuelTypeId
  }

  if (status) {
    where.status = status
  }

  if (vehicleType) {
    where.vehicle = {
      vehicleType, // ⚠️ ensure Prisma field is correct (NOT "type")
    }
  }

  if (search) {
    where.OR = [
      { requestCode: { contains: search, mode: "insensitive" } },
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        vehicle: {
          plateNumber: { contains: search, mode: "insensitive" },
        },
      },
    ]
  }

  const orderBy = {
    createdAt: sort === "asc" ? "asc" : "desc",
  }

  /* ---------------------------------
     MAIN DATA QUERY
  ---------------------------------- */
  const result = await fuelRequestRepository.findStationRequests({
    where,
    skip,
    take: Number(limit),
    orderBy,
  })

  /* ---------------------------------
     SUMMARY (NO PAGINATION)
  ---------------------------------- */
  const [pendingStats, approvedStats, rejectedStats, totalStats] =
    await Promise.all([
      fuelRequestRepository.aggregateStationRequests({
        where: { ...where, status: "PENDING" },
        _count: { _all: true },
        _sum: { requestedLiters: true },
      }),

      fuelRequestRepository.aggregateStationRequests({
        where: { ...where, status: "APPROVED" },
        _count: { _all: true },
      }),

      fuelRequestRepository.aggregateStationRequests({
        where: { ...where, status: "REJECTED" },
        _count: { _all: true },
      }),

      fuelRequestRepository.aggregateStationRequests({
        where,
        _sum: { requestedLiters: true },
      }),
    ])

  return {
    data: result.data,
    pagination: {
      total: result.total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(result.total / Number(limit)),
      hasNext: page * limit < result.total,
      hasPrev: page > 1,
    },

    summary: {
      pendingCount: pendingStats._count._all ?? 0,
      totalRequestedLiters: totalStats._sum.requestedLiters ?? 0,
    },
  }
}


import prisma from "../../../config/db";
import { FuelRequestStatus } from "@prisma/client";
import { resolveFuelPrice } from "../../../rules/pricing.rules"

interface VerifyFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
}

export const verifyFuelRequestService = async ({
  fuelRequestId,
  operatorId,
  stationId,
}: VerifyFuelRequestInput) => {
  return await prisma.$transaction(async (tx) => {

    // =====================================================
    // 1. FETCH FULL CONTEXT
    // =====================================================
    const fuelRequest = await tx.fuelRequest.findUnique({
      where: { id: fuelRequestId },
      include: {
        user: {
          include: {
            driverProfile: true,
          },
        },
        vehicle: true,
      },
    });

    if (!fuelRequest) {
      throw { statusCode: 404, message: "Fuel request not found" };
    }

    // =====================================================
    // 2. GUARDS (FAST FAIL)
    // =====================================================
    if (fuelRequest.stationId !== stationId) {
      throw { statusCode: 403, message: "Unauthorized station access" };
    }

    if (fuelRequest.status !== FuelRequestStatus.PENDING) {
      throw {
        statusCode: 400,
        message: `Only PENDING requests can be verified (current: ${fuelRequest.status})`,
      };
    }

    if (fuelRequest.assignedToId) {
      throw {
        statusCode: 409,
        message: "Request already processed by another operator",
      };
    }

    const driver = fuelRequest.user?.driverProfile;
    const vehicle = fuelRequest.vehicle;

    if (!driver) {
      throw { statusCode: 400, message: "Driver profile not found" };
    }

    if (!vehicle) {
      throw { statusCode: 400, message: "Vehicle not found" };
    }

    // =====================================================
    // 3. TRUST ON FIRST USE (IDEMPOTENT)
    // =====================================================

    const updates: Promise<any>[] = [];

    // Driver trust
    if (!driver.isVerified) {
      updates.push(
        tx.driverProfile.update({
          where: { id: driver.id },
          data: {
            isVerified: true,
            updatedAt: new Date(),
          },
        })
      );
    }

    // Vehicle trust
    if (!vehicle.isVerified) {
      updates.push(
        tx.vehicle.update({
          where: { id: vehicle.id },
          data: {
            isVerified: true,
            updatedAt: new Date(),
          },
        })
      );
    }

    // Run trust updates in parallel (if any)
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // =====================================================
    // 4. UPDATE FUEL REQUEST (SINGLE SOURCE OF TRUTH)
    // =====================================================
    const updated = await tx.fuelRequest.update({
      where: { id: fuelRequest.id },
      data: {
        status: FuelRequestStatus.VERIFIED,
        verifiedAt: new Date(),
        assignedToId: operatorId,
      },
      include: {
        user: {
          include: {
            driverProfile: true,
          },
        },
        vehicle: true,
        station: true,
        fuelType: true,
      },
    });

    return updated;
  });
};

interface RejectFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
  rejectionReasonId: string;
  rejectionNote?: string;
}

export const rejectFuelRequestService = async ({
  fuelRequestId,
  operatorId,
  stationId,
  rejectionReasonId,
  rejectionNote,
}: RejectFuelRequestInput) => {
  return prisma.$transaction(async (tx) => {
    // ==========================================
    // Get Fuel Request
    // ==========================================
    const fuelRequest = await tx.fuelRequest.findUnique({
      where: { id: fuelRequestId },
    });

    if (!fuelRequest) {
      throw {
        statusCode: 404,
        message: "Fuel request not found.",
      };
    }

    // ==========================================
    // Station validation
    // ==========================================
    if (fuelRequest.stationId !== stationId) {
      throw {
        statusCode: 403,
        message: "Unauthorized station access.",
      };
    }

    // ==========================================
    // Status validation
    // ==========================================
    if (fuelRequest.status !== FuelRequestStatus.PENDING) {
      throw {
        statusCode: 400,
        message: `Only PENDING requests can be rejected. Current status: ${fuelRequest.status}`,
      };
    }

    // ==========================================
    // Validate rejection reason
    // ==========================================
    const reason = await tx.rejectionReason.findFirst({
      where: {
        id: rejectionReasonId,
        isActive: true,
      },
    });

    if (!reason) {
      throw {
        statusCode: 400,
        message: "Invalid rejection reason.",
      };
    }

    // ==========================================
    // Reject request
    // ==========================================
    return tx.fuelRequest.update({
      where: {
        id: fuelRequest.id,
      },
      data: {
        status: FuelRequestStatus.REJECTED,
        rejectionReasonId,
        rejectionNote,
        assignedToId: operatorId,
      },
      include: {
        user: {
          include: {
            driverProfile: true,
          },
        },
        vehicle: true,
        station: true,
        fuelType: true,
        rejectionReason: true,
      },
    });
  });
};


interface GetStationFuelRequestByIdInput {
  fuelRequestId: string;
  stationId: string;
}

export const getStationFuelRequestByIdService = async ({
  fuelRequestId,
  stationId,
}: GetStationFuelRequestByIdInput) => {
  const fuelRequest = await fuelRequestRepository.findById(fuelRequestId);

  if (!fuelRequest) {
    throw {
      statusCode: 404,
      message: "Fuel request not found.",
    };
  }

  if (fuelRequest.stationId !== stationId) {
    throw {
      statusCode: 403,
      message: "Unauthorized station access.",
    };
  }

  return fuelRequest;
};

interface GetCurrentFuelRequestInput {
  operatorId: string;
  stationId: string;
}

export const getCurrentFuelRequestService = async ({
  operatorId,
  stationId,
}: GetCurrentFuelRequestInput) => {
  const fuelRequest =
    await fuelRequestRepository.currentFuelRequest({
      operatorId,
      stationId,
    });

  return fuelRequest;
};


interface ApproveFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
  approvedLiters: number;
  nozzleId: string;
}

export const approveFuelRequestService = async ({
  fuelRequestId,
  operatorId,
  stationId,
  approvedLiters,
  nozzleId,
}: ApproveFuelRequestInput) => {
  return prisma.$transaction(async (tx) => {
    // ==========================================
    // Get Fuel Request
    // ==========================================
    const fuelRequest = await tx.fuelRequest.findUnique({
      where: {
        id: fuelRequestId,
      },
    });

    if (!fuelRequest) {
      throw {
        statusCode: 404,
        message: "Fuel request not found.",
      };
    }

    // ==========================================
    // Station validation
    // ==========================================
    if (fuelRequest.stationId !== stationId) {
      throw {
        statusCode: 403,
        message: "Unauthorized station access.",
      };
    }

    // ==========================================
    // Status validation
    // ==========================================
    if (fuelRequest.status !== FuelRequestStatus.VERIFIED) {
      throw {
        statusCode: 400,
        message: `Only VERIFIED requests can be approved. Current status: ${fuelRequest.status}`,
      };
    }

    // ==========================================
    // Validate nozzle
    // ==========================================
    const nozzle = await tx.nozzle.findFirst({
      where: {
        id: nozzleId,
        status: "active",
        dispenser: {
          stationId,
          status: "active",
        },
      },
    });

    if (!nozzle) {
      throw {
        statusCode: 400,
        message: "Selected nozzle is invalid or inactive.",
      };
    }

    // ==========================================
    // Validate approved liters
    // ==========================================
    if (!approvedLiters || approvedLiters <= 0) {
      throw {
        statusCode: 400,
        message: "Approved liters must be greater than zero.",
      };
    }

    if (approvedLiters > fuelRequest.requestedLiters) {
      throw {
        statusCode: 400,
        message: "Approved liters cannot exceed requested liters.",
      };
    }

    // ==========================================
    // Approve request
    // ==========================================
    const approvedRequest = await tx.fuelRequest.update({
      where: {
        id: fuelRequest.id,
      },
      data: {
        status: FuelRequestStatus.APPROVED,
        approvedLiters,
        nozzleId,
        approvedAt: new Date(),
        assignedToId: operatorId,
      },
      include: {
        user: {
          include: {
            driverProfile: true,
          },
        },
        vehicle: true,
        station: true,
        fuelType: true,
        nozzle: {
          include: {
            dispenser: true,
          },
        },
      },
    });

    return approvedRequest;
  });
};

interface CancelFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
}

export const cancelFuelRequestService = async ({
  fuelRequestId,
  operatorId,
  stationId,
}: CancelFuelRequestInput) => {
  return prisma.$transaction(async (tx) => {
    // ==========================================
    // Get Fuel Request
    // ==========================================
    const fuelRequest = await tx.fuelRequest.findUnique({
      where: {
        id: fuelRequestId,
      },
    });

    if (!fuelRequest) {
      throw {
        statusCode: 404,
        message: "Fuel request not found.",
      };
    }

    // ==========================================
    // Station validation
    // ==========================================
    if (fuelRequest.stationId !== stationId) {
      throw {
        statusCode: 403,
        message: "Unauthorized station access.",
      };
    }

    // ==========================================
    // Status validation
    // ==========================================
    if (
      fuelRequest.status === FuelRequestStatus.COMPLETED ||
      fuelRequest.status === FuelRequestStatus.REJECTED ||
      fuelRequest.status === FuelRequestStatus.CANCELLED
    ) {
      throw {
        statusCode: 400,
        message: `Fuel request cannot be cancelled. Current status: ${fuelRequest.status}`,
      };
    }

    // ==========================================
    // Cancel request
    // ==========================================
    const cancelledRequest = await tx.fuelRequest.update({
      where: {
        id: fuelRequest.id,
      },
    
      data: {
        status: FuelRequestStatus.CANCELLED,
    
        // operator who cancelled the request
        cancelledBy: operatorId,
    
        // cancellation timestamp
        cancelledAt: new Date(),
    
        // keep assignment history
        assignedToId: operatorId,
      },
    
      include: {
        user: {
          include: {
            driverProfile: true,
          },
        },
        vehicle: true,
        station: true,
        fuelType: true,
        nozzle: {
          include: {
            dispenser: true,
          },
        },
      },
    });

    return cancelledRequest;
  });
};

interface StartDispensingFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
}

export const startDispensingFuelRequestService = async ({
  fuelRequestId,
  operatorId,
  stationId,
}: StartDispensingFuelRequestInput) => {
  return prisma.$transaction(async (tx) => {

    // ==========================================
    // Get Fuel Request
    // ==========================================
    const fuelRequest = await tx.fuelRequest.findUnique({
      where: {
        id: fuelRequestId,
      },
    });

    if (!fuelRequest) {
      throw {
        statusCode: 404,
        message: "Fuel request not found.",
      };
    }


    // ==========================================
    // Station validation
    // ==========================================
    if (fuelRequest.stationId !== stationId) {
      throw {
        statusCode: 403,
        message: "Unauthorized station access.",
      };
    }


    // ==========================================
    // Status validation
    // ==========================================
    if (fuelRequest.status !== FuelRequestStatus.APPROVED) {
      throw {
        statusCode: 400,
        message: `Only APPROVED requests can start dispensing. Current status: ${fuelRequest.status}`,
      };
    }


    // ==========================================
    // Validate nozzle assignment
    // ==========================================
    if (!fuelRequest.nozzleId) {
      throw {
        statusCode: 400,
        message: "Nozzle is not assigned to this request.",
      };
    }


    // ==========================================
    // Start dispensing
    // ==========================================
    const updatedRequest = await tx.fuelRequest.update({
      where: {
        id: fuelRequest.id,
      },
      data: {
        status: FuelRequestStatus.DISPENSING,
        assignedToId: operatorId,
      },
      include: {
        user: {
          include: {
            driverProfile: true,
          },
        },
        vehicle: true,
        station: true,
        fuelType: true,
        nozzle: {
          include: {
            dispenser: true,
          },
        },
      },
    });


    return updatedRequest;
  });
};

interface CompleteDispensingFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
  dispensedLiters: number;
}

interface CompleteDispensingFuelRequestInput {
  fuelRequestId: string;
  operatorId: string;
  stationId: string;
  dispensedLiters: number;
}


export const completeDispensingFuelRequestService = async ({
  fuelRequestId,
  operatorId,
  stationId,
  dispensedLiters,
}: CompleteDispensingFuelRequestInput) => {

  return prisma.$transaction(async (tx) => {

    // ==========================================
    // Get Fuel Request Context
    // ==========================================
    const fuelRequest = await tx.fuelRequest.findUnique({
      where: {
        id: fuelRequestId,
      },
      include: {
        user: true,
        vehicle: true,
        station: true,
        fuelType: true,
      },
    });


    if (!fuelRequest) {
      throw {
        statusCode: 404,
        message: "Fuel request not found.",
      };
    }


    // ==========================================
    // Station validation
    // ==========================================
    if (fuelRequest.stationId !== stationId) {
      throw {
        statusCode: 403,
        message: "Unauthorized station access.",
      };
    }


    // ==========================================
    // Status validation
    // ==========================================
    if (fuelRequest.status !== FuelRequestStatus.DISPENSING) {
      throw {
        statusCode: 400,
        message:
          `Only DISPENSING requests can be completed. Current status: ${fuelRequest.status}`,
      };
    }


    // ==========================================
    // Validate liters
    // ==========================================
    if (!dispensedLiters || dispensedLiters <= 0) {
      throw {
        statusCode: 400,
        message: "Dispensed liters must be greater than zero.",
      };
    }


    if (
      fuelRequest.approvedLiters &&
      dispensedLiters > fuelRequest.approvedLiters
    ) {
      throw {
        statusCode: 400,
        message:
          "Dispensed liters cannot exceed approved liters.",
      };
    }



    // ==========================================
    // Get System Price Settings
    // ==========================================
    const settings = await tx.systemSettings.findFirst();


    if (!settings) {
      throw {
        statusCode: 500,
        message: "Fuel pricing configuration missing.",
      };
    }



    // ==========================================
    // Get Station Override Price
    // ==========================================
    const stationOverride =
      await tx.stationFuelPrice.findFirst({
        where: {
          stationId: fuelRequest.stationId,
          fuelTypeId: fuelRequest.fuelTypeId,
          isOverride: true,
        },
      });



    // ==========================================
    // Resolve Final Price
    // ==========================================
    const pricePerLiter = resolveFuelPrice(
      {
        id: fuelRequest.fuelType.id,
        name: fuelRequest.fuelType.name,
        price: fuelRequest.fuelType.price,
      },
      stationOverride
        ? {
            fuelTypeId: stationOverride.fuelTypeId,
            pricePerLiter: stationOverride.pricePerLiter,
            isOverride: stationOverride.isOverride,
          }
        : null,
      {
        priceControlMode:
          settings.priceControlMode as "FIXED" | "OVERRIDE",
      }
    );



    if (pricePerLiter <= 0) {
      throw {
        statusCode: 400,
        message: "Invalid fuel price configuration.",
      };
    }



    // ==========================================
    // Calculate Cost
    // ==========================================
    const totalCost =
      dispensedLiters * pricePerLiter;



    // ==========================================
    // Complete Fuel Request
    // ==========================================
    const completedRequest =
      await tx.fuelRequest.update({

        where: {
          id: fuelRequest.id,
        },

        data: {
          status: FuelRequestStatus.COMPLETED,
          dispensedLiters,
          completedAt: new Date(),
          assignedToId: operatorId,
        },
      });



    // ==========================================
    // Create Transaction Snapshot
    // ==========================================
    await tx.transaction.create({

      data: {
        type: "NORMAL",

        fuelRequestId: fuelRequest.id,

        userId: fuelRequest.userId,

        vehicleId: fuelRequest.vehicleId,

        stationId: fuelRequest.stationId,

        fuelTypeId: fuelRequest.fuelTypeId,


        litersGiven: dispensedLiters,

        // 🔥 final price used at dispensing time
        pricePerLiter,

        totalCost,


        paymentStatus: "PAID",
      },

    });



    // ==========================================
    // Return Completed Request
    // ==========================================
    return tx.fuelRequest.findUnique({

      where: {
        id: completedRequest.id,
      },

      include: {

        user: {
          include: {
            driverProfile: true,
          },
        },

        vehicle: true,

        station: true,

        fuelType: true,

        nozzle: {
          include: {
            dispenser: true,
          },
        },

        transaction: true,
      },

    });

  });
};