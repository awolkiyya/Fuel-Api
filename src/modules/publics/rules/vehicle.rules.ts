import { validateVehicleLimits } from "../../../rules/limits/vehicle-limits.engine";

export function validateVehicleRules(ctx: any) {
  return validateVehicleLimits({
    vehicleId: ctx.vehicle.id,
    vehicleType: ctx.vehicleType,

    usedTodayLiters: ctx.usedTodayLiters,
    usedHourLiters: ctx.usedHourLiters,

    newLiters: ctx.requestedLiters,

    refillsToday: ctx.refillsToday,
    lastRefillTime: ctx.lastRefillTime,

    now: new Date(),
  });
}