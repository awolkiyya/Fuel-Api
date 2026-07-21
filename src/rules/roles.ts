export const ROLES = {
  ADMIN: "admin",
  DRIVER: "driver",
  STATION_STAFF: "station_staff",
  STATION_MANAGER: "station_manager",
} as const;

export type Role =
  (typeof ROLES)[keyof typeof ROLES];