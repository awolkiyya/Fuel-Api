/**
 * 💰 Resolve final fuel price (production-safe)
 * Priority:
 * 1. System FIXED mode → base fuel price
 * 2. Station override (if OVERRIDE mode enabled)
 * 3. fallback → fuel base price
 */

type FuelTypeLite = {
  id: string;
  name: string;
  price: number;
};

type StationFuelPriceLite = {
  fuelTypeId: string;
  pricePerLiter: number;
  isOverride: boolean;
} | null;

type SystemSettingsLite = {
  priceControlMode: "FIXED" | "OVERRIDE";
};

export function resolveFuelPrice(
  fuelType: FuelTypeLite,
  stationOverride: StationFuelPriceLite,
  settings: SystemSettingsLite
): number {
  // ==============================
  // 🛡️ SAFETY
  // ==============================
  if (!fuelType) return 0;

  const basePrice = Number(fuelType.price || 0);

  // ==============================
  // 🔒 FIXED MODE (GLOBAL CONTROL)
  // ==============================
  if (settings.priceControlMode === "FIXED") {
    return basePrice;
  }

  // ==============================
  // 🏢 OVERRIDE MODE (STATION LEVEL)
  // ==============================
  if (
    settings.priceControlMode === "OVERRIDE" &&
    stationOverride?.isOverride &&
    typeof stationOverride.pricePerLiter === "number" &&
    stationOverride.pricePerLiter > 0
  ) {
    return Number(stationOverride.pricePerLiter);
  }

  // ==============================
  // 🔁 FALLBACK
  // ==============================
  return basePrice;
}