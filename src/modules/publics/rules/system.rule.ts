export function validateSystemRules(ctx: any) {
    if (!ctx.system?.systemActive) {
      return {
        valid: false,
        reason: "SYSTEM_DISABLED",
      };
    }
  
    return { valid: true };
  }