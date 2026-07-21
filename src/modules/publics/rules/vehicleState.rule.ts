export function validateVehicleState(ctx: any): {
  valid: boolean;
  reason?: string;
} {
  const vehicle = ctx.vehicle;

  if (!vehicle) {
    return { valid: false, reason: "VEHICLE_NOT_FOUND" };
  }

  // ❌ permanently blocked vehicle
  if (vehicle.isDeleted) {
    return { valid: false, reason: "VEHICLE_DELETED" };
  }

  // 🔒 ownership security rule
  if (vehicle.userId !== ctx.user.id) {
    return { valid: false, reason: "UNAUTHORIZED_VEHICLE" };
  }

  return { valid: true };
}