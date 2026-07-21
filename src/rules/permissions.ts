export const PERMISSIONS = {
  ALL: "*",

  // 🔥 Fuel system
  CREATE_FUEL_REQUEST: "create_fuel_request",
  VIEW_FUEL_REQUEST: "view_fuel_request",
  APPROVE_FUEL_REQUEST: "approve_fuel_request",

  // 🏢 Station
  VIEW_STATION: "view_station",
  MANAGE_STATION: "manage_station",

  // 📊 Dashboard
  VIEW_DASHBOARD: "view_dashboard",

  // 👤 Users (ADD THESE)
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  // 👑 Admin
  MANAGE_USERS: "manage_users",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];