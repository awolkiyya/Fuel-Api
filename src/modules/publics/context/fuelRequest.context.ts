import prisma from "../../../config/db";
import { startOfDay } from "date-fns";

export type FuelRequestContext = {
  user: any;
  vehicle: any;
  vehicleType: any;
  businessLicense: any;
  station: any;
  system: any;

  userRisk: any; // 🔥 ADDED

  distanceKm: number;

  usedTodayLiters: number;
  usedHourLiters: number;

  refillsToday: number;
  lastRefillTime: Date | null;

  requestedLiters: number;
};

export async function buildFuelRequestContext(params: {
  userId: string;
  vehicleId: string;
  stationId: string;
  requestedLiters: number;
  distanceKm: number;
}): Promise<FuelRequestContext> {

  const now = new Date();
  const today = startOfDay(now);

  const hourStart = new Date(now);
  hourStart.setMinutes(0, 0, 0);

  // ======================
  // 🚗 VEHICLE + USER
  // ======================
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.vehicleId },
    include: {
      vehicleType: true,
      user: {
        include: {
          businessLicense: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw new Error("VEHICLE_NOT_FOUND");
  }

  // ======================
  // ⛽ STATION
  // ======================
  const station = await prisma.station.findUnique({
    where: { id: params.stationId },
  });

  if (!station) {
    throw new Error("STATION_NOT_FOUND");
  }

  // ======================
  // ⚙️ SYSTEM SETTINGS
  // ======================
  const system = await prisma.systemSettings.findFirst();

  // ======================
  // 🚨 USER RISK (NEW LAYER)
  // ======================
  const userRisk = await prisma.userRisk.findFirst({
    where: {
      userId: params.userId,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // ======================
  // 📊 DAILY USAGE
  // ======================
  const dailyUsage = await prisma.vehicleDailyUsage.findUnique({
    where: {
      vehicleId_date: {
        vehicleId: params.vehicleId,
        date: today,
      },
    },
  });

  const usedTodayLiters = dailyUsage?.totalLiters ?? 0;

  // ======================
  // 📊 HOURLY USAGE
  // ======================
  const hourlyAgg = await prisma.fuelRequest.aggregate({
    where: {
      vehicleId: params.vehicleId,
      createdAt: {
        gte: hourStart,
      },
    },
    _sum: {
      requestedLiters: true,
    },
  });

  const usedHourLiters = hourlyAgg._sum.requestedLiters ?? 0;

  // ======================
  // 📊 REFILL COUNT
  // ======================
  const refillsToday = await prisma.fuelRequest.count({
    where: {
      vehicleId: params.vehicleId,
      createdAt: {
        gte: today,
      },
    },
  });

  // ======================
  // ⏱ LAST REFILL TIME
  // ======================
  const lastRequest = await prisma.fuelRequest.findFirst({
    where: {
      vehicleId: params.vehicleId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  const lastRefillTime = lastRequest?.createdAt ?? null;

  // ======================
  // 🔥 FINAL CONTEXT
  // ======================
  return {
    user: { id: params.userId },

    vehicle,
    vehicleType: vehicle.vehicleType,
    businessLicense: vehicle.user.businessLicense,

    station,
    system,

    userRisk, // 🔥 IMPORTANT

    distanceKm: params.distanceKm,

    usedTodayLiters,
    usedHourLiters,

    refillsToday,
    lastRefillTime,

    requestedLiters: params.requestedLiters,
  };
}