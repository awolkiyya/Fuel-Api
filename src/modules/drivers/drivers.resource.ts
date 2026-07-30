export const driverResource = (driver: any) => {
   const profile = driver.driverProfile ?? null
   const vehicles = driver.vehicles ?? []
   const risks = driver.risks ?? []
   const businessLicense = driver.businessLicense ?? null
 
   const latestRisk = risks[0] ?? null
   const highRiskCount = risks.filter((r: any) => r.level === "high").length
   const activeRiskCount = risks.filter((r: any) => r.status === "active").length
 
   return {
     id: driver.id,
 
     /* -----------------------------
        BASIC INFO
        NOTE: kept snake_case `full_name` / `profile_image` to match
        the frontend's Driver type exactly — renaming these is what
        broke the profile card and avatar before.
     ------------------------------ */
     full_name: driver.full_name,
     phone: driver.phone,
     email: driver.email ?? null,
     profile_image: driver.profile_image ?? null,
     role: driver.role,
     gender: driver.gender,
 
     /* -----------------------------
        STATUS
     ------------------------------ */
     status: driver.status,
 
     /* -----------------------------
        DRIVER PROFILE
     ------------------------------ */
     driverProfile: profile
       ? {
           id: profile.id,
           age: profile.age,
           nationalId: profile.nationalId,
           licenseNumber: profile.licenseNumber,
           licenseExpiry: profile.licenseExpiry ?? null,
           isVerified: profile.isVerified,
         }
       : null,
 
     /* -----------------------------
        VEHICLES
        Full shape — the Vehicles tab renders vin, fuelType,
        fuelCapacity and regionCode, so trimming to id/plateNumber
        (as before) left it with nothing to show.
     ------------------------------ */
     vehicles: vehicles.map((v: any) => ({
       id: v.id,
       plateNumber: v.plateNumber,
       vin: v.vin,
       fuelCapacity: v.fuelCapacity,
       regionCode: v.regionCode,
       isVerified: v.isVerified,
       isActive: v.isActive,
       vehicleType: { name: v.vehicleType?.name ?? "Unknown" },
       fuelType: { name: v.fuelType?.name ?? "Unknown" },
       createdAt: v.createdAt,
     })),
     // Cheap summary fields for list/table views that don't need the full array.
     vehicleCount: vehicles.length,
     hasSingleVehicle: vehicles.length === 1,
     hasMultipleVehicles: vehicles.length > 1,
 
     /* -----------------------------
        BUSINESS LICENSE
        Missing entirely before — the License tab has nothing to
        render without it.
     ------------------------------ */
     businessLicense: businessLicense
       ? {
           id: businessLicense.id,
           licenseNumber: businessLicense.licenseNumber,
           documentUrl: businessLicense.documentUrl ?? null,
           expiryDate: businessLicense.expiryDate ?? null,
           // NOTE: schema enum is PENDING | ACTIVE | REJECTED | EXPIRED —
           // there is no APPROVED value. The frontend type/LICENSE_CLS
           // map need to be updated to match this, not the other way around.
           status: businessLicense.status,
           requestType: businessLicense.requestType, // NEW | RENEWAL
           rejectionReason: businessLicense.rejectionReason ?? null,
           issuedBy: businessLicense.issuedBy ?? null,
           issuedAt: businessLicense.issuedAt ?? null,
           createdAt: businessLicense.createdAt,
           updatedAt: businessLicense.updatedAt,
         }
       : null,
 
     /* -----------------------------
        RISKS
        Full history for the Risks tab, plus a normalized summary
        for anywhere (e.g. the drivers table) that only needs the
        latest level/status at a glance.
     ------------------------------ */
     risks: risks.map((r: any) => ({
       id: r.id,
       level: r.level,
       status: r.status,
       reason: r.reason,
       detectedBy: r.detectedBy,
       createdAt: r.createdAt,
     })),
     riskSummary: {
       level: latestRisk?.level ?? "low",
       status: latestRisk?.status ?? null,
       reason: latestRisk?.reason ?? null,
       highRiskCount,
       activeRiskCount,
     },
 
     /* -----------------------------
        DATES
     ------------------------------ */
     createdAt: driver.createdAt,
     updatedAt: driver.updatedAt,
   }
 }