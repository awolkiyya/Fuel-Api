export function validateBusinessLicense(ctx: any) {
    const type = ctx.vehicleType;
    console.log(ctx);
  
    if (!type.requiresBusinessLicense) {
      return { valid: true };
    }
  
    if (!ctx.businessLicense) {
      return {
        valid: false,
        reason: "BUSINESS_LICENSE_REQUIRED",
      };
    }
  
    if (ctx.businessLicense.status !== "ACTIVE") {
      return {
        valid: false,
        reason: "BUSINESS_LICENSE_NOT_ACTIVE",
      };
    }
  
    if (
      ctx.businessLicense.expiryDate &&
      new Date(ctx.businessLicense.expiryDate) < new Date()
    ) {
      return {
        valid: false,
        reason: "BUSINESS_LICENSE_EXPIRED",
      };
    }
  
    return { valid: true };
  }