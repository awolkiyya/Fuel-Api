export const FuelRequestResource = (item: any) => {
    return {
      // ================= CORE IDENTITY =================
      id: item.id,
      requestCode: item.id.slice(0, 8).toUpperCase(),
  
      // ================= DRIVER (USER) =================
      // ================= DRIVER (USER) =================
user: item.user
? {
    // ───────── Identity ─────────
    id: item.user.id,
    full_name: item.user.full_name,
    phone: item.user.phone,
    email: item.user.email,

    profile_image: item.user.profile_image,

    gender: item.user.gender,
    role: item.user.role,

    // ───────── System status ─────────
    status: item.user.status,

    // ───────── Station context ─────────
    stationId: item.user.stationId,

    // ───────── Driver Profile (RELATION) ─────────
    driverProfile: item.user.driverProfile
      ? {
          id: item.user.driverProfile.id,

          age: item.user.driverProfile.age,

          nationalId: item.user.driverProfile.nationalId,
          licenseNumber: item.user.driverProfile.licenseNumber,
          licenseExpiry: item.user.driverProfile.licenseExpiry,

          isVerified: item.user.driverProfile.isVerified,

          createdAt: item.user.driverProfile.createdAt,
          updatedAt: item.user.driverProfile.updatedAt,
        }
      : null,

    // ───────── Risk & analytics (from relation) ─────────
    riskLevel: item.user.risks?.[0]?.level ?? "LOW",

    // ───────── Audit ─────────
    createdAt: item.user.createdAt,
    updatedAt: item.user.updatedAt,
  }
: null,
  
vehicle: item.vehicle
? {
    // ================= CORE =================
    id: item.vehicle.id,
    plateNumber: item.vehicle.plateNumber,
    vin: item.vehicle.vin,
    regionCode: item.vehicle.regionCode,

    // ================= VEHICLE TYPE =================
    vehicleType: item.vehicle.vehicleType
      ? {
          id: item.vehicle.vehicleType.id,
          code: item.vehicle.vehicleType.code,
          name: item.vehicle.vehicleType.name,
          category: item.vehicle.vehicleType.category ?? null,
          codeLabel: item.vehicle.vehicleType.codeLabel ?? null,

          // verification rules
          requiresDriverLicense:
            item.vehicle.vehicleType.requiresDriverLicense,
          requiresBusinessLicense:
            item.vehicle.vehicleType.requiresBusinessLicense,

          // fuel constraints
          maxLitersPerHour:
            item.vehicle.vehicleType.maxLitersPerHour,
          minRefillIntervalMinutes:
            item.vehicle.vehicleType.minRefillIntervalMinutes ?? null,
          maxRefillsPerDay:
            item.vehicle.vehicleType.maxRefillsPerDay ?? null,
          maxDailyLiters:
            item.vehicle.vehicleType.maxDailyLiters ?? null,

          // meta
          description: item.vehicle.vehicleType.description ?? null,
          status: item.vehicle.vehicleType.status,
        }
      : null,

    // ================= BASE FUEL TYPE (VEHICLE DEFAULT) =================
    fuelType: item.vehicle.fuelType
      ? {
          id: item.vehicle.fuelType.id,
          name: item.vehicle.fuelType.name,
          price: item.vehicle.fuelType.price ?? null,
          status: item.vehicle.fuelType.status,
        }
      : null,

    // ================= CAPACITY & STATE =================
    fuelCapacity: item.vehicle.fuelCapacity,
    isVerified: item.vehicle.isVerified,
    isActive: item.vehicle.isActive,
    isDeleted: item.vehicle.isDeleted,

    // ================= RELATION IDS (useful for debugging / filtering) =================
    vehicleTypeId: item.vehicle.vehicleTypeId,
    fuelTypeId: item.vehicle.fuelTypeId,
  }
: null,    
  
      // ================= STATION =================
      station: item.station
        ? {
            id: item.station.id,
            name: item.station.name,
            city: item.station.city,
            region: item.station.region,
            status: item.station.status,
          }
        : null,
  
      // ================= FUEL TYPE =================
      fuelType: item.fuelType
        ? {
            id: item.fuelType.id,
            name: item.fuelType.name,
            price: item.fuelType.price,
            status: item.fuelType.status,
          }
        : null,
  
      // ================= LITERS =================
        requested: item.requestedLiters,
        approved: item.approvedLiters ?? null,
        dispensed: item.dispensedLiters ?? null,
  
      // ================= STATUS =================
      status: item.status,
  
      workflow: {
        isPending: item.status === "PENDING",
        isVerified: item.status === "VERIFIED",
        isApproved: item.status === "APPROVED",
        isAssigned: item.status === "ASSIGNED",
        isDispensing: item.status === "DISPENSING",
        isCompleted: item.status === "COMPLETED",
        isRejected: item.status === "REJECTED",
        isCancelled: item.status === "CANCELLED",
      },
  
      // ================= TIMELINE =================
      timeline: {
        verifiedAt: item.verifiedAt ?? null,
        approvedAt: item.approvedAt ?? null,
        completedAt: item.completedAt ?? null,
        cancelledAt: item.cancelledAt ?? null,
      },
  
      // ================= OPERATOR (SINGLE SOURCE OF TRUTH) =================
      assignedTo: item.assignedTo
        ? {
            id: item.assignedTo.id,
            name: item.assignedTo.full_name,
            phone: item.assignedTo.phone ?? null,
            role: item.assignedTo.role ?? null,
          }
        : null,
  
      // ================= DISPENSING =================
      nozzle: item.nozzle
        ? {
            id: item.nozzle.id,
            number: item.nozzle.number,
            fuelType: item.nozzle.fuelType,
            status: item.nozzle.status,
          }
        : null,
  
      // ================= REJECTION =================
      rejection: item.rejectionReason
        ? {
            id: item.rejectionReason.id,
            code: item.rejectionReason.code,
            label: item.rejectionReason.label,
            priority: item.rejectionReason.priority,
            note: item.rejectionNote ?? null,
          }
        : null,
  
      // ================= TRANSACTION =================
      transaction: item.transaction
        ? {
            id: item.transaction.id,
            litersGiven: item.transaction.litersGiven,
            totalCost: item.transaction.totalCost,
            paymentStatus: item.transaction.paymentStatus,
          }
        : null,
  
      // ================= META =================
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }