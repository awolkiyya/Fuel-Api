import { Router } from "express"

import {
  createStation,
  getStations,
  getStationById,
  updateStation,
  getManagers,
  assignManager,
  updateStationFuel,
  getStationFuelTypes,
  createTank,
  refillTank,
  getDispensersByStation,
  createDispenser,
  toggleDispenserStatus,
  addNozzle,
  toggleNozzleStatus,
  updateQueueZone,
  adjustTankLevel,
  getStationAuditLogs,
  getStationFuelConfig,
  updateStationFuelConfig,
  getStationNozzles, // 🔥 NEW
} from "./controllers/stations.controller"

import { authMiddleware } from "../../middlewares/auth.middleware"
import { validate } from "../../middlewares/validate.middleware"
import { createStationSchema, updateStationSchema } from "../../schemas/stations.schema"
import upload from "../../middlewares/upload.middleware"
import { createStationStaffSchema, updateStaffPasswordSchema, updateStaffStatusSchema } from "../../schemas/staff.schema"
import { createStationStaff, getStationStaff, getStationStaffById, updateStaffPassword, updateStaffStatus } from "./controllers/staff.controller"
import { approveFuelRequest, cancelFuelRequest, completeDispensingFuelRequest, getCurrentStationFuelRequest, getRejectionReasons, getStationFuelRequestById, getStationFuelRequests, rejectFuelRequest, startDispensingFuelRequest, verifyFuelRequest } from "./controllers/station-operator.controller"

const router = Router()

// ================= CREATE =================
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validate(createStationSchema),
  createStation
)

// ================= UPDATE =================
router.put(
  "/:id",
  authMiddleware,
  upload .single("image"),
  validate(updateStationSchema),
  updateStation
)

// ================= GET MANAGERS =================
router.get("/managers", authMiddleware, getManagers)

// ================= READ =================
router.get("/", authMiddleware, getStations)
router.get("/:id", authMiddleware, getStationById)


// ================= ASSIGN MANAGER =================
router.patch(
  "/:id/assign-manager",
  authMiddleware,
  assignManager
)


// ================= 🔥 FUEL MANAGEMENT (NEW CORE FEATURE) =================
router.patch(
  "/:id/fuel",
  authMiddleware,
  updateStationFuel
)

router.get(
  "/:id/fuel-types",
  authMiddleware,
  getStationFuelTypes
)

router.post(
  "/:id/tanks",
  authMiddleware,
  createTank
)
router.post(
  "/:id/tanks/:tankId/refill",
  authMiddleware,
  refillTank
)
router.post(
  "/:id/tanks/:tankId/adjust",
  authMiddleware,
  adjustTankLevel
)


router.get(
  "/:id/fuel-config",
  authMiddleware,
  getStationFuelConfig
);

router.patch(
  "/:id/fuel-config",
  authMiddleware,
  updateStationFuelConfig
);


// ================= 🧾 AUDIT LOGS =================

router.get(
  "/:id/audit-logs",
  authMiddleware,
  getStationAuditLogs
)

// ================= 🚀 DISPENSERS (PUMPS) =================

// GET all pumps for a station
router.get(
  "/:id/pumps",
  authMiddleware,
  getDispensersByStation
)

// CREATE pump
router.post(
  "/:id/pumps",
  authMiddleware,
  createDispenser
)

// TOGGLE pump status
router.patch(
  "/:id/pumps/:pumpId/toggle",
  authMiddleware,
  toggleDispenserStatus
)

// ================= 🚀 NOZZLES =================

// ADD nozzle to pump
router.post(
  "/:id/pumps/:pumpId/nozzles",
  authMiddleware,
  addNozzle
)

// TOGGLE nozzle status
router.patch(
  "/:id/pumps/:pumpId/nozzles/:nozzleId/toggle",
  authMiddleware,
  toggleNozzleStatus
)

router.get(
  "/:id/nozzles",
  authMiddleware,
  getStationNozzles
)



// ================= 👷 STATION STAFF MANAGEMENT =================

// GET all staff for a station
router.get(
  "/:id/staff",
  authMiddleware,
  getStationStaff
)

// CREATE staff (pump attendant)
router.post(
  "/:id/staff",
  authMiddleware,
  validate(createStationStaffSchema),
  createStationStaff
)

// UPDATE staff status (NO DELETE SYSTEM)
router.patch(
  "/:id/staff/:userId/status",
  authMiddleware,
  validate(updateStaffStatusSchema),
  updateStaffStatus
)

// UPDATE staff password (SECURITY DOMAIN)
router.patch(
  "/:id/staff/:userId/password",
  authMiddleware,
  validate(updateStaffPasswordSchema),
  updateStaffPassword
)

// OPTIONAL: get single staff member
router.get(
  "/:id/staff/:userId",
  authMiddleware,
  getStationStaffById
)


// now here manage the fuel transactions/request info also,fuel for stations
router.get(
  "/:id/fuel-transactions",
  authMiddleware,
  getStationStaffById
)

// // here the station operator side routes
//  // ================= 🚏 STATION OPERATOR (FUEL REQUESTS) =================

// // GET station-specific fuel requests (filter + search + pagination)
// router.get(
//   "/station-operator/fuel-requests",
//   authMiddleware,
//   getStationFuelRequests
// )

// // =====================================================
// // GET rejection reasons (for dropdown/UI)
// // =====================================================
// router.get(
//   "/station-operator/rejection-reasons",
//   authMiddleware,
//   getRejectionReasons
// );


// here work flow
// 1.verifie
// 2.reject
// 3.approve
// 4.assignNozzle
// 5.dispense
// 6.complate
// 7.canclerequest



// ================= 🚏 STATION OPERATOR =================

// =====================================================
// FUEL REQUESTS
// =====================================================

// Get station fuel requests (filter, search, pagination)
router.get(
  "/station-operator/fuel-requests",
  authMiddleware,
  getStationFuelRequests
);

// Dropdown list
router.get(
  "/station-operator/rejection-reasons",
  authMiddleware,
  getRejectionReasons
);


// Get single fuel request details
router.get(
  "/station-operator/fuel-requests/:id",
  authMiddleware,
  getStationFuelRequestById
);

router.get(
  "/station-operator/fuel-request/current",
  authMiddleware,
  getCurrentStationFuelRequest
);

// =====================================================
// WORKFLOW ACTIONS
// =====================================================

// Verify request
router.patch(
  "/station-operator/fuel-requests/:id/verify",
  authMiddleware,
  verifyFuelRequest
);

// Reject request
router.patch(
  "/station-operator/fuel-requests/:id/reject",
  authMiddleware,
  rejectFuelRequest
);

// Approve request
router.patch(
  "/station-operator/fuel-requests/:id/approve",
  authMiddleware,
  approveFuelRequest
);

// Start dispensing request
router.patch(
  "/station-operator/fuel-requests/:id/start-dispensing",
  authMiddleware,
  startDispensingFuelRequest
);

// Complete dispensing request
router.patch(
  "/station-operator/fuel-requests/:id/complete",
  authMiddleware,
  completeDispensingFuelRequest
);


// Cancel request
router.patch(
  "/station-operator/fuel-requests/:id/cancel",
  authMiddleware,
  cancelFuelRequest
);



// Start dispensing
// router.patch(
//   "/station-operator/fuel-requests/:id/start-dispensing",
//   authMiddleware,
//   startFuelDispensing
// );

// // Complete dispensing
// router.patch(
//   "/station-operator/fuel-requests/:id/complete",
//   authMiddleware,
//   completeFuelDispensing
// );

// =====================================================
// REJECTION REASONS
// =====================================================

// =====================================================
// NOZZLES
// =====================================================

// Available nozzles for station
// router.get(
//   "/station-operator/nozzles",
//   authMiddleware,
//   getStationNozzles
// );

// Available nozzles only
// router.get(
//   "/station-operator/nozzles/available",
//   authMiddleware,
//   getAvailableNozzles
// );

// =====================================================
// DASHBOARD
// =====================================================

// Dashboard KPIs
// router.get(
//   "/station-operator/dashboard",
//   authMiddleware,
//   getStationDashboard
// );

// =====================================================
// TRANSACTIONS
// =====================================================

// // Fuel transactions
// router.get(
//   "/station-operator/transactions",
//   authMiddleware,
//   getStationTransactions
// );

// // Single transaction
// router.get(
//   "/station-operator/transactions/:id",
//   authMiddleware,
//   getStationTransactionById
// );










// GET single fuel request (full details)
// router.get(
//   "/station-operator/fuel-requests/:requestId",
//   authMiddleware,
//   getStationFuelRequestById
// )

// // START processing fuel request (approve + begin dispensing)
// router.post(
//   "/station-operator/fuel-requests/:requestId/start",
//   authMiddleware,
//   startFuelRequest
// )

// // COMPLETE fuel dispensing
// router.post(
//   "/station-operator/fuel-requests/:requestId/complete",
//   authMiddleware,
//   completeFuelRequest
// )

// // REJECT fuel request
// router.post(
//   "/station-operator/fuel-requests/:requestId/reject",
//   authMiddleware,
//   rejectFuelRequest
// )



/* =========================================================
   QUEUE ZONE (AI CONFIG ONLY)
========================================================= */




// ================= 🚦 TRAFFIC =================

// GET current traffic state
// router.get(
//   "/:id/traffic",
//   authMiddleware,
//   getStationTraffic
// )

// // UPDATE traffic (AI or manual override)
// router.patch(
//   "/:id/traffic",
//   authMiddleware,
//   updateStationTraffic
// )

// // GET traffic history (analytics)
// router.get(
//   "/:id/traffic/history",
//   authMiddleware,
//   getTrafficHistory
// )


// ================= 🏢 STATION OVERRIDE PRICING =================

// GET station fuel prices (override + fallback info)
// router.get(
//   "/:id/fuel-pricing",
//   authMiddleware,
//   getStationFuelPrice
// )

// // SET override price for station + fuel type
// router.post(
//   "/:id/fuel-pricing",
//   authMiddleware,
//   setStationFuelPrice
// )

// // DISABLE override (fallback to city price)
// router.delete(
//   "/:id/fuel-pricing/:fuelTypeId",
//   authMiddleware,
//   disableStationFuelOverride
// )


// here the station camera , station settings , station trafic


export default router