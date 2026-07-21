import { Request, Response } from "express";
import prisma from "../../../config/db";

/**
 * =====================================================
 * 🚨 HOME BANNER LICENSE CHECK
 * =====================================================
 * Returns UI-ready banner state for frontend
 */
export const checkBusinessLicenseBanner = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).user?.id;

    // =====================================================
    // 🔐 AUTH CHECK
    // =====================================================
    if (!userId) {
      return res.status(401).json({
        success: false,
        showBanner: false,
        reason: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    // =====================================================
    // 📄 GET USER LICENSE
    // =====================================================
    const license = await prisma.businessLicense.findUnique({
      where: { userId },
    });

    const now = new Date();

    // =====================================================
    // 🚨 NO LICENSE
    // =====================================================
    if (!license) {
      return res.status(200).json({
        success: true,
        data:{
          "showBanner":true,
          "reason": "NO_LICENSE",
          "message":"You do not have a business license. Please apply to continue using fuel services for vehicle Need Business License."
  
        }
      
      });
    }

    // =====================================================
    // ⛔ STATUS + EXPIRY VALIDATION
    // =====================================================
    const isExpired =
      license.expiryDate && license.expiryDate < now;

    const isPending = license.status === "PENDING";
    const isRejected = license.status === "REJECTED";
    const isInactive = license.status !== "ACTIVE";

    // =====================================================
    // 🚨 DETERMINE BANNER STATE
    // =====================================================
    let showBanner = false;
    let reason = "OK";
    let message = "All good";

    if (isExpired) {
      showBanner = true;
      reason = "EXPIRED";
      message = "Your business license has expired. Please renew it to continue using fuel services.";
    } 
    else if (isPending) {
      showBanner = true;
      reason = "PENDING";
      message = "Your business license is currently under review.";
    } 
    else if (isRejected) {
      showBanner = true;
      reason = "REJECTED";
      message = "Your business license was rejected. Please reapply.";
    } 
    else if (isInactive) {
      showBanner = true;
      reason = "INACTIVE";
      message = "Your business license is not active. Please contact support.";
    }

    // =====================================================
    // 📤 RESPONSE
    // =====================================================
    return res.status(200).json({
      success: true,
      data:{
        "showBanner":showBanner,
        "reason":reason,
        "message":message

      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      showBanner: false,
      reason: "SERVER_ERROR",
      message: error?.message || "License check failed",
      data: null,
    });
  }
};


// export const createFuelRequest = async (req: Request, res: Response) => {
//     try {
//       const userId = (req as any).user?.id;
//       const { vehicleId, fuelTypeId, stationId, liters } = req.body;
  
//       // =====================================================
//       // 🔐 AUTH
//       // =====================================================
//       if (!userId) {
//         return res.status(401).json({ success: false, message: "Unauthorized" });
//       }
  
//       // =====================================================
//       // 🚗 VEHICLE CHECK
//       // =====================================================
//       const vehicle = await prisma.vehicle.findFirst({
//         where: { id: vehicleId, userId, isDeleted: false },
//         include: { vehicleType: true },
//       });
  
//       if (!vehicle) {
//         return res.status(404).json({
//           success: false,
//           message: "Vehicle not found",
//         });
//       }
  
//       // =====================================================
//       // ⛽ FUEL TYPE CHECK (STATION CONTEXT)
//       // =====================================================
//       const stationFuel = await prisma.stationFuel.findFirst({
//         where: {
//           stationId,
//           fuelTypeId,
//           isActive: true,
//         },
//       });
  
//       if (!stationFuel) {
//         return res.status(400).json({
//           success: false,
//           message: "Fuel type not available at this station",
//         });
//       }
  
//       // =====================================================
//       // 🔐 LICENSE CHECK (ONLY IF REQUIRED)
//       // =====================================================
//       const requiresLicense =
//         vehicle.vehicleType.requiresBusinessLicense ?? false;
  
//       if (requiresLicense) {
//         const license = await prisma.businessLicense.findFirst({
//           where: {
//             userId,
//             isVerified: true,
//           },
//         });
  
//         const now = new Date();
  
//         const isValid =
//           license &&
//           (!license.expiryDate || license.expiryDate > now);
  
//         if (!isValid) {
//           return res.status(403).json({
//             success: false,
//             message: "Valid business license required",
//           });
//         }
//       }
  
//       // =====================================================
//       // 📊 USAGE LIMIT CHECK (TODAY)
//       // =====================================================
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
  
//       const usage = await prisma.vehicleDailyUsage.findUnique({
//         where: {
//           vehicleId_date: {
//             vehicleId: vehicle.id,
//             date: today,
//           },
//         },
//       });
  
//       const usedLiters = usage?.totalLiters ?? 0;
  
//       const maxAllowed = vehicle.vehicleType.maxLitersPerHour * 24;
  
//       if (usedLiters + liters > maxAllowed) {
//         return res.status(403).json({
//           success: false,
//           message: "Daily fuel limit exceeded",
//         });
//       }
  
//       // =====================================================
//       // ⏱ REFILL COOLDOWN CHECK
//       // =====================================================
//       const last = usage?.updatedAt;
  
//       if (last) {
//         const diff =
//           Date.now() - new Date(last).getTime();
  
//         const minInterval =
//           vehicle.vehicleType.minRefillIntervalMinutes * 60000;
  
//         if (diff < minInterval) {
//           return res.status(403).json({
//             success: false,
//             message: "Refill cooldown active",
//           });
//         }
//       }
  
//       // =====================================================
//       // ✅ CREATE REQUEST
//       // =====================================================
//       const request = await prisma.fuelRequest.create({
//         data: {
//           userId,
//           vehicleId,
//           stationId,
//           fuelTypeId,
//           liters,
//           status: "PENDING",
//         },
//       });
  
//       return res.status(201).json({
//         success: true,
//         message: "Fuel request created",
//         data: request,
//       });
//     } catch (error: any) {
//       return res.status(500).json({
//         success: false,
//         message: error.message || "Request failed",
//       });
//     }
//   };