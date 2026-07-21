import { VehicleType } from "@prisma/client";

export function getRemainingDailyFuel(
  vehicleType: VehicleType,
  usedToday: number
): number {
  return Math.max(
    (vehicleType.maxDailyLiters ?? 0) - usedToday,
    0
  );
}

export function isNearDailyLimit(
  vehicleType: VehicleType,
  usedToday: number,
  threshold = 0.8
): boolean {
  if (!vehicleType.maxDailyLiters) return false;

  return usedToday >= vehicleType.maxDailyLiters * threshold;
}

export function isNearHourlyLimit(
  vehicleType: VehicleType,
  usedHour: number,
  threshold = 0.8
): boolean {
  if (!vehicleType.maxLitersPerHour) return false;

  return usedHour >= vehicleType.maxLitersPerHour * threshold;
}