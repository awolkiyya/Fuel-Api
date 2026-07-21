export function validateDistanceRule(ctx: any) {
    const maxDistance = ctx.system?.maxRequestDistanceKm ?? 1;
  
    if (ctx.distanceKm > maxDistance) {
      return {
        valid: false,
        reason: `DISTANCE_LIMIT_EXCEEDED ${ctx.distanceKm} `,
      };
    }
  
    return { valid: true };
  }