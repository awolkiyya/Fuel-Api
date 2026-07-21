export interface Coordinates {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/* =========================================================
   🧠 SAFE HAVERSINE DISTANCE ENGINE (PRODUCTION)
========================================================= */

export function calculateDistance(
  from: Coordinates,
  to: Coordinates,
  unit: "km" | "m" = "km"
): number {
  console.debug("[DistanceCalc] Raw input:", { from, to, unit });

  const safeFrom = normalizeCoords(from);
  const safeTo = normalizeCoords(to);

  console.debug("[DistanceCalc] Normalized coords:", {
    safeFrom,
    safeTo,
  });

  validateCoords(safeFrom);
  validateCoords(safeTo);

  const dLat = toRadians(safeTo.lat - safeFrom.lat);
  const dLng = toRadians(safeTo.lng - safeFrom.lng);

  const lat1 = toRadians(safeFrom.lat);
  const lat2 = toRadians(safeTo.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = EARTH_RADIUS_KM * c;

  const result = unit === "m" ? distanceKm * 1000 : distanceKm;

  console.debug("[DistanceCalc] Result:", {
    distanceKm,
    result,
    unit,
  });

  return result;
}

/* =========================================================
   🔧 AUTO FIX SWAPPED COORDINATES
========================================================= */

function normalizeCoords(coords: Coordinates): Coordinates {
  const { lat, lng } = coords;

  // detect swapped coordinates (very common DB bug)
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    return { lat: lng, lng: lat };
  }

  return coords;
}

/* =========================================================
   🛡 VALIDATION GUARD (CRITICAL FOR PRODUCTION)
========================================================= */

function validateCoords(coords: Coordinates) {
  if (
    typeof coords.lat !== "number" ||
    typeof coords.lng !== "number"
  ) {
    throw new Error("INVALID_COORDINATES_TYPE");
  }

  if (coords.lat < -90 || coords.lat > 90) {
    throw new Error("INVALID_LATITUDE");
  }

  if (coords.lng < -180 || coords.lng > 180) {
    throw new Error("INVALID_LONGITUDE");
  }
}

/* =========================================================
   🔢 DEGREE → RADIAN
========================================================= */

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}