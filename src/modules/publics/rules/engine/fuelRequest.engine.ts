import { validateVehicleState } from "../vehicleState.rule";
import { validateBusinessLicense } from "../businessLicense.rule";
import { validateDistanceRule } from "../distance.rule";
import { validateVehicleRules } from "../vehicle.rules";
import { validateSystemRules } from "../system.rule";

export function validateFuelRequest(ctx: any) {

  const rules = [
    validateSystemRules,
    validateVehicleState,
    validateBusinessLicense,
    validateDistanceRule,
    validateVehicleRules,
  ];

  for (const rule of rules) {
    const result = rule(ctx);

    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}
