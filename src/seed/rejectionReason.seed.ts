import { PrismaClient, RejectionPriority } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRejectionReasons() {
  const reasons = [
    // =====================================================
    // AUTHORIZATION
    // =====================================================
    {
      code: "NOT_AUTHORIZED",
      label: "Vehicle is not authorized for fueling",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "INVALID_DRIVER",
      label: "Driver is not authorized",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "INVALID_VEHICLE",
      label: "Vehicle is not registered",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "VEHICLE_INACTIVE",
      label: "Vehicle is inactive",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "DRIVER_INACTIVE",
      label: "Driver is inactive",
      priority: RejectionPriority.HIGH,
    },

    // =====================================================
    // ALLOCATION
    // =====================================================
    {
      code: "NO_ALLOCATION",
      label: "No fuel allocation available",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "LIMIT_EXCEEDED",
      label: "Fuel allocation limit exceeded",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "INSUFFICIENT_BALANCE",
      label: "Insufficient fuel balance",
      priority: RejectionPriority.HIGH,
    },

    // =====================================================
    // FUEL VALIDATION
    // =====================================================
    {
      code: "WRONG_FUEL_TYPE",
      label: "Requested fuel type is not permitted",
      priority: RejectionPriority.HIGH,
    },

    // =====================================================
    // QR / REQUEST VALIDATION
    // =====================================================
    {
      code: "INVALID_QR",
      label: "Invalid QR code",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "QR_ALREADY_USED",
      label: "QR code has already been used",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "REQUEST_EXPIRED",
      label: "Fuel request has expired",
      priority: RejectionPriority.MEDIUM,
    },
    {
      code: "REQUEST_CANCELLED",
      label: "Fuel request was cancelled",
      priority: RejectionPriority.LOW,
    },
    {
      code: "REQUEST_ALREADY_PROCESSED",
      label: "Fuel request has already been processed",
      priority: RejectionPriority.HIGH,
    },

    // =====================================================
    // STATION OPERATIONS
    // =====================================================
    {
      code: "OUT_OF_STOCK",
      label: "Requested fuel is out of stock",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "PUMP_OFFLINE",
      label: "Fuel pump is unavailable",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "STATION_CLOSED",
      label: "Fuel station is currently closed",
      priority: RejectionPriority.MEDIUM,
    },
    {
      code: "STATION_INACTIVE",
      label: "Fuel station is inactive",
      priority: RejectionPriority.HIGH,
    },

    // =====================================================
    // SYSTEM
    // =====================================================
    {
      code: "NETWORK_ERROR",
      label: "Network communication failed",
      priority: RejectionPriority.MEDIUM,
    },
    {
      code: "SYSTEM_ERROR",
      label: "Internal system error",
      priority: RejectionPriority.HIGH,
    },
    {
      code: "UNKNOWN_ERROR",
      label: "Unknown error occurred",
      priority: RejectionPriority.MEDIUM,
    },
  ];

  for (const reason of reasons) {
    await prisma.rejectionReason.upsert({
      where: {
        code: reason.code,
      },
      update: {
        label: reason.label,
        priority: reason.priority,
        isActive: true,
      },
      create: {
        ...reason,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${reasons.length} rejection reasons.`);
}