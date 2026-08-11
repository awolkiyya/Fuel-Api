import { Router } from "express"


import onboardingRoute from "../modules/onboarding/onboarding.route"
import authRoutes from "../modules/auth/auth.routes"
import userRoutes from "../modules/users/users.routes"
import driverRoutes from "../modules/drivers/drivers.routes"
import driverLicenseRoutes from "../modules/drivers/driver-license.routes"
import vehicleRoutes from "../modules/vehicles/vehicles.routes"
import commenRoutes from "../modules/commens/commen.routes"
import stationRoutes from "../modules/stations/routes/stations.routes"
import systemRoutes from "../modules/system/system.routes"
import cameraRoutes from "../modules/cameras/cameras.route"

import publicSationsRoutes from "../modules/publics/routes/stations.route"
import publicvehiclesRoutes from "../modules/publics/routes/driverVehicle.routes"
import publicfuelRequestRoutes from "../modules/publics/routes/fuelRequest.route"
import publicLicenseRoutes from "../modules/publics/routes/publicLicenseRoutes"
import publicFuelTransactionRoutes from "../modules/publics/routes/publicfuelTransactionRoutes"

import businessLicenseRoutes from "../modules/business-license/businessLicense.routes"

import organizationRoutes from "../modules/organizations/organizations.routes"
import quotaRoutes from "../modules/organizations/quota/quota.routes"

import aiRoutes from "../modules/ai/ai.routes"


const router = Router()


// =====================================================
// AUTH MODULE
// =====================================================

console.log("🔐 /auth routes loaded")

router.use(
  "/auth",
  authRoutes,
)


// =====================================================
// USER MODULE
// =====================================================

console.log("👤 /users routes loaded")

router.use(
  "/users",
  userRoutes,
)


// =====================================================
// DRIVER MODULE
// =====================================================

console.log("👤 /drivers routes loaded")

router.use(
  "/drivers",
  driverRoutes,
)


// =====================================================
// DRIVER LICENSE MODULE
// =====================================================

// Mounted at:
//
// /driver/license
//
// This matches the existing Flutter application
// endpoints:
//
// POST /driver/license
// POST /driver/license/upload

console.log("🪪 /driver/license routes loaded")

router.use(
  "/driver/license",
  driverLicenseRoutes,
)


// =====================================================
// VEHICLE MODULE
// =====================================================

console.log("🚗 /vehicles routes loaded")

router.use(
  "/vehicles",
  vehicleRoutes,
)


// =====================================================
// ONBOARDING MODULE
// =====================================================

console.log("🧭 /onboarding routes loaded")

router.use(
  "/onboarding",
  onboardingRoute,
)


// =====================================================
// STATION MODULE
// =====================================================

console.log("🧭 /stations routes loaded")

router.use(
  "/stations",
  stationRoutes,
)


// =====================================================
// COMMEN MODULE
// =====================================================

console.log("🧭 /commens routes loaded")

router.use(
  "/commens",
  commenRoutes,
)


// =====================================================
// SYSTEM MODULE
// =====================================================

console.log("🧭 /system routes loaded")

router.use(
  "/system",
  systemRoutes,
)


// =====================================================
// CAMERA MODULE
// =====================================================

console.log("🧭 /cameras routes loaded")

router.use(
  "/cameras",
  cameraRoutes,
)


// =====================================================
// BUSINESS LICENSE MODULE
// =====================================================

console.log("🧭 /license routes loaded")

router.use(
  "/license",
  businessLicenseRoutes,
)


// =====================================================
// ORGANIZATION QUOTA MODULE
// =====================================================
//
// IMPORTANT:
//
// This must be registered before the generic
// /organizations routes.
//
// quotaRoutes:
//
// GET    /
// POST   /
// GET    /active
// GET    /:id
// PATCH  /:id
// POST   /:id/approve
// POST   /:id/cancel
// POST   /:id/refresh-status
//
// Mounted here:
//
// /organizations/quotas
//
// Therefore:
//
// POST /api/organizations/quotas
//
// reaches:
//
// quotaRoutes -> router.post("/", createQuota)
//

console.log("⛽ /organizations/quotas routes loaded")

router.use(
  "/organizations/quotas",
  quotaRoutes,
)


// =====================================================
// ORGANIZATION MODULE
// =====================================================
//
// General organization routes:
//
// GET    /organizations
// POST   /organizations
// GET    /organizations/:id
// PATCH  /organizations/:id
// DELETE /organizations/:id
// PATCH  /organizations/:id/status
// PATCH  /organizations/:id/fuel-access
// PATCH  /organizations/:id/fuel-policy
//

console.log("🏢 /organizations routes loaded")

router.use(
  "/organizations",
  organizationRoutes,
)


// =====================================================
// AI MODULE
// =====================================================

console.log("🧭 /ai routes loaded")

router.use(
  "/ai",
  aiRoutes,
)


// =====================================================
// PUBLIC ROUTES
// =====================================================

console.log("🧭 /public/stations routes loaded")

router.use(
  "/public/stations",
  publicSationsRoutes,
)


router.use(
  "/public/vehicles",
  publicvehiclesRoutes,
)


router.use(
  "/public/fuelrequests",
  publicfuelRequestRoutes,
)


router.use(
  "/public/fueltransactions",
  publicFuelTransactionRoutes,
)


console.log("🧭 /public/license routes loaded")

router.use(
  "/public/license",
  publicLicenseRoutes,
)


export default router





// station side and admin side 
// router.use("/fuel-requests", fuelRequestRoutes);
// GET    /api/v1/fuel-requests
// GET    /api/v1/fuel-requests/:id

// PATCH  /api/v1/fuel-requests/:id/approve
// PATCH  /api/v1/fuel-requests/:id/reject

// PATCH  /api/v1/fuel-requests/:id/assign-operator
// PATCH  /api/v1/fuel-requests/:id/assign-nozzle

// PATCH  /api/v1/fuel-requests/:id/start
// PATCH  /api/v1/fuel-requests/:id/complete
