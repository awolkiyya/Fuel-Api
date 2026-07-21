import { VehicleType } from "@prisma/client";
import {
  checkDailyFuelLimit,
  checkMaxRefillsPerDay,
  checkMinRefillInterval,
  checkHourlyFuelLimit,
} from "./vehicle-limits.core";

export type VehicleLimitContext = {
  /**
   * Vehicle being validated.
   * All usage metrics below must belong to this vehicle only.
   */
  vehicleId: string;

  vehicleType: VehicleType;

  /**
   * Usage statistics for this specific vehicle.
   */
  usedTodayLiters: number;
  usedHourLiters?: number;

  /**
   * Current request.
   */
  newLiters: number;

  /**
   * Refill history for this specific vehicle.
   */
  refillsToday: number;
  lastRefillTime: Date | null;

  now: Date;
};

export type VehicleLimitValidationResult = {
  valid: boolean;
  reason?: string;
};

export function validateVehicleLimits(
  ctx: VehicleLimitContext
): VehicleLimitValidationResult {
  const vt = ctx.vehicleType;

  console.log(ctx);

  // ===============================
  // INVALID INPUT GUARDS
  // ===============================
  if (!ctx.vehicleId) {
    return {
      valid: false,
      reason: "INVALID_VEHICLE_ID",
    };
  }

  if (!vt) {
    return {
      valid: false,
      reason: "INVALID_VEHICLE_TYPE",
    };
  }

  if (!vt.maxDailyLiters || vt.maxDailyLiters <= 0) {
    return {
      valid: false,
      reason: "INVALID_VEHICLE_TYPE_CONFIG",
    };
  }

  // ===============================
  // 1. DAILY LIMIT
  // ===============================
  const dailyLimitPassed = checkDailyFuelLimit(
    ctx.usedTodayLiters,
    ctx.newLiters,
    vt.maxDailyLiters
  );

  if (!dailyLimitPassed) {
    return {
      valid: false,
      reason: "DAILY_FUEL_LIMIT_EXCEEDED",
    };
  }

  // ===============================
  // 2. HOURLY LIMIT
  // ===============================
  const hourlyLimitPassed = checkHourlyFuelLimit(
    ctx.usedHourLiters ?? 0,
    ctx.newLiters,
    vt.maxLitersPerHour
  );

  if (!hourlyLimitPassed) {
    return {
      valid: false,
      reason: "HOURLY_FUEL_LIMIT_EXCEEDED",
    };
  }

  // ===============================
  // 3. MAX REFILLS PER DAY
  // ===============================
  const refillCountPassed = checkMaxRefillsPerDay(
    ctx.refillsToday,
    vt.maxRefillsPerDay
  );

  if (!refillCountPassed) {
    return {
      valid: false,
      reason: "MAX_REFILLS_EXCEEDED",
    };
  }

  // ===============================
  // 4. MIN REFILL INTERVAL
  // ===============================
  const refillIntervalPassed = checkMinRefillInterval(
    ctx.lastRefillTime,
    ctx.now,
    vt.minRefillIntervalMinutes
  );

  if (!refillIntervalPassed) {
    return {
      valid: false,
      reason: "MIN_REFILL_INTERVAL_NOT_MET",
    };
  }

  // ===============================
  // SUCCESS
  // ===============================
  return {
    valid: true,
  };
}