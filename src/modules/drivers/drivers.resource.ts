export const driverResource = (driver: any) => {
   const latestRisk = driver.risks?.[0] ?? null
   const vehicles = driver.vehicles ?? []
   const profile = driver.driverProfile ?? null
 
   return {
     id: driver.id,
 
     /* -----------------------------
        BASIC INFO
     ------------------------------ */
     fullName: driver.full_name,
     phone: driver.phone,
     email: driver.email,
     avatar: driver.profile_image,
 
     /* -----------------------------
        STATUS
     ------------------------------ */
     status: driver.status,
 
     /* -----------------------------
        DRIVER PROFILE (NEW)
     ------------------------------ */
     driverProfile: profile
       ? {
           age: profile.age,
           nationalId: profile.nationalId,
           licenseNumber: profile.licenseNumber,
           licenseExpiry: profile.licenseExpiry,
           isVerified: profile.isVerified,
         }
       : null,
 
     /* -----------------------------
        RISK (NORMALIZED)
     ------------------------------ */
     riskLevel: latestRisk?.level ?? "low",
     riskStatus: latestRisk?.status ?? null,
     riskReason: latestRisk?.reason ?? null,
 
     /* -----------------------------
        VEHICLES (DERIVED)
     ------------------------------ */
     vehicleCount: vehicles.length,
     hasSingleVehicle: vehicles.length === 1,
     hasMultipleVehicles: vehicles.length > 1,
 
     vehicles: vehicles.map((v: any) => ({
       id: v.id,
       plateNumber: v.plateNumber,
     })),
 
     /* -----------------------------
        DATES
     ------------------------------ */
     createdAt: driver.createdAt,
   }
 }