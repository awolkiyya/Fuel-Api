import { FuelType, StationFuelType } from "@prisma/client"

/**
 * ==============================
 * ⛽ FUEL CORE RULES
 * ==============================
 * Pure business logic for:
 * - fuel availability
 * - station fuel validation
 * - capacity safety
 * - dispensing rules
 * - refill rules
 */

/**
 * Check if global fuel type is active
 */
export function isFuelTypeActive(fuel: FuelType): boolean {
  return fuel.status === "ACTIVE"
}

/**
 * Check if station has this fuel enabled and usable
 */
export function isStationFuelActive(
  stationFuel: StationFuelType
): boolean {
  return stationFuel.isActive && stationFuel.maxCapacity > 0
}

/**
 * Validate that station fuel configuration is valid
 */
export function validateStationFuelConfig(
  stationFuel: StationFuelType
): boolean {
  return (
    stationFuel.fuelTypeId !== null &&
    stationFuel.stationId !== null &&
    stationFuel.maxCapacity > 0
  )
}

/**
 * Check if fuel can be dispensed safely from tank
 * (prevents negative inventory)
 */
export function canDispenseFuel(
  currentLevel: number,
  requestedLiters: number
): boolean {
  return currentLevel >= requestedLiters
}

/**
 * Calculate remaining fuel after dispensing
 */
export function calculateRemainingFuel(
  currentLevel: number,
  dispensedLiters: number
): number {
  return Math.max(currentLevel - dispensedLiters, 0)
}

/**
 * Check if tank can be refilled without exceeding capacity
 */
export function canRefillTank(
  currentLevel: number,
  refillLiters: number,
  maxCapacity: number
): boolean {
  return currentLevel + refillLiters <= maxCapacity
}

/**
 * Calculate expected tank level after refill
 */
export function calculateRefillLevel(
  currentLevel: number,
  refillLiters: number,
  maxCapacity: number
): number {
  const newLevel = currentLevel + refillLiters
  return newLevel > maxCapacity ? maxCapacity : newLevel
}

/**
 * Validate fuel type matches station configuration
 * (prevents mixing wrong fuel types in tanks)
 */
export function validateFuelTypeMatch(
  fuelTypeId: string,
  stationFuelTypeId: string
): boolean {
  return fuelTypeId === stationFuelTypeId
}

/**
 * Detect abnormal fuel usage pattern (basic fraud signal)
 */
export function detectAbnormalFuelFlow(
  liters: number,
  timeSeconds: number
): boolean {
  if (timeSeconds <= 0) return true

  const flowRate = liters / timeSeconds

  // unrealistic boundaries (can be tuned later with AI)
  return flowRate > 3 || flowRate < 0.05
}

/**
 * Check if station fuel is at critical low level
 */
export function isLowFuelWarning(
  currentLevel: number,
  maxCapacity: number,
  thresholdPercent = 0.15
): boolean {
  return currentLevel <= maxCapacity * thresholdPercent
}

/**
 * Get fuel utilization percentage
 */
export function getFuelUtilization(
  currentLevel: number,
  maxCapacity: number
): number {
  if (maxCapacity === 0) return 0
  return (currentLevel / maxCapacity) * 100
}