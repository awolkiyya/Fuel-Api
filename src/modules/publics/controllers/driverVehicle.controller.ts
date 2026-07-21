import { Request, Response } from "express";
import prisma from "../../../config/db";

/**
 * =====================================================
 * 🚗 DRIVER VEHICLES (LIST)
 * =====================================================
 */

export const getDriverActiveVehicleCard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const driverId = (req as any).user?.id;

    // =====================================================
    // 🔐 AUTH CHECK
    // =====================================================
    if (!driverId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =====================================================
    // 🚗 ALL ACTIVE VEHICLES
    // =====================================================
    const vehicles = await prisma.vehicle.findMany({
      where: {
        userId: driverId,
        isActive: true,
        isDeleted: false,
      },
      include: {
        fuelType: true,
        vehicleType: true,
      },
    });

    if (!vehicles.length) {
      return res.status(404).json({
        success: false,
        message: "No active vehicles found",
      });
    }

    // =====================================================
    // 📅 TODAY
    // =====================================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // =====================================================
    // 📤 BUILD RESPONSE LIST
    // =====================================================
    const result = await Promise.all(
      vehicles.map(async (vehicle) => {
        // =====================================================
        // 📊 USAGE
        // =====================================================
        const usage = await prisma.vehicleDailyUsage.findUnique({
          where: {
            vehicleId_date: {
              vehicleId: vehicle.id,
              date: today,
            },
          },
        });

        const usedLiters = usage?.totalLiters ?? 0;

        // =====================================================
        // ⚙️ RULES
        // =====================================================
        const maxLitersPerHour =
          vehicle.vehicleType.maxLitersPerHour ?? 0;

        const maxRefillsPerDay =
          vehicle.vehicleType.maxRefillsPerDay ?? 0;

        const minRefillIntervalMinutes =
          vehicle.vehicleType.minRefillIntervalMinutes ?? 0;

        // =====================================================
        // 📊 CALCULATIONS
        // =====================================================
        const derivedDailyCapacity = maxLitersPerHour * 24;

        const remainingLiters = Math.max(
          derivedDailyCapacity - usedLiters,
          0
        );

        const exceededLiters = Math.max(
          usedLiters - derivedDailyCapacity,
          0
        );

        const progressPercent =
          derivedDailyCapacity > 0
            ? Math.round((usedLiters / derivedDailyCapacity) * 100)
            : 0;

        let status = "LOW";
        if (progressPercent >= 90) status = "CRITICAL";
        else if (progressPercent >= 70) status = "HIGH";
        else if (progressPercent >= 40) status = "MEDIUM";

        const isNearLimit = progressPercent >= 85;
        const isLimitExceeded = exceededLiters > 0;

        // =====================================================
        // ⏱ REFILL LOGIC
        // =====================================================
        const lastRefuelAt = usage?.updatedAt ?? null;

        let nextRefillAt: string | null = null;
        let canRefillNow = true;
        let remainingWaitMinutes: number | null = null;

        if (lastRefuelAt && minRefillIntervalMinutes > 0) {
          const last = new Date(lastRefuelAt);
          const next = new Date(
            last.getTime() + minRefillIntervalMinutes * 60000
          );

          nextRefillAt = next.toISOString();

          const now = new Date();
          if (now < next) {
            canRefillNow = false;
            remainingWaitMinutes = Math.ceil(
              (next.getTime() - now.getTime()) / 60000
            );
          }
        }

        // =====================================================
        // 📦 RETURN SINGLE VEHICLE OBJECT
        // =====================================================
        return {
          vehicle: {
            id: vehicle.id,
            name: vehicle.vehicleType.name,
            plateNumber: vehicle.plateNumber,
            fuelType: {
              id: vehicle.fuelType.id,
              name: vehicle.fuelType.name,
            },
            fuelCapacity: vehicle.fuelCapacity,
            isVerified: vehicle.isVerified,
            isActive: vehicle.isActive,
          },

          usage: {
            usedLiters,
            derivedDailyCapacity,
            remainingLiters,
            exceededLiters,
            isLimitExceeded,
            progressPercent,
            status,
            isNearLimit,
          },

          rules: {
            maxLitersPerHour,
            maxRefillsPerDay,
            minRefillIntervalMinutes,
          },

          today: {
            date: today.toISOString().split("T")[0],
            lastRefuelAt,
          },

          refill: {
            nextRefillAt,
            canRefillNow,
            remainingWaitMinutes,
          },
        };
      })
    );

    // =====================================================
    // 📤 FINAL RESPONSE (LIST)
    // =====================================================
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to load vehicles",
    });
  }
};