import { Router } from "express";

import onboardingRoute from "../modules/onboarding/onboarding.route";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/users.routes";
import driverRoutes from "../modules/drivers/drivers.routes";
import vehicleRoutes from "../modules/vehicles/vehicles.routes";
import commenRoutes from "../modules/commens/commen.routes";
import stationRoutes from "../modules/stations/stations.routes";
import systemRoutes from "../modules/system/system.routes";
import cameraRoutes from "../modules/cameras/cameras.route";
import publicSationsRoutes from "../modules/publics/routes/stations.route";
import publicvehiclesRoutes from "../modules/publics/routes/driverVehicle.routes";
import publicfuelRequestRoutes from "../modules/publics/routes/fuelRequest.route";
import publicLicenseRoutes from "../modules/publics/routes/publicLicenseRoutes";

import businessLicenseRoutes from "../modules/business-license/businessLicense.routes";




const router = Router();

// =========================
// AUTH MODULE
// =========================
console.log("🔐 /auth routes loaded");
router.use("/auth", authRoutes);

// =========================
// USER MODULE
// =========================
console.log("👤 /users routes loaded");
router.use("/users", userRoutes);

// =========================
// Driver MODULE
// =========================
console.log("👤 /drivers routes loaded");
router.use("/drivers", driverRoutes);

// =========================
// VEHICLE MODULE
// =========================
console.log("🚗 /vehicles routes loaded");
router.use("/vehicles", vehicleRoutes);

// =========================
// ONBOARDING MODULE
// =========================
console.log("🧭 /onboarding routes loaded");
router.use("/onboarding", onboardingRoute);


// =========================
// STATION MODULE
// =========================
console.log("🧭 /stations routes loaded");
router.use("/stations", stationRoutes);

// =========================
// COMMEN MODULE
// =========================
console.log("🧭 /commens routes loaded");
router.use("/commens", commenRoutes);

// =========================
// COMMEN MODULE
// =========================
console.log("🧭 /system routes loaded");
router.use("/system", systemRoutes);


// camera related route
console.log("🧭 /cameras routes loaded");
router.use("/cameras", cameraRoutes);


// business license 
// camera related route
console.log("🧭 /license routes loaded");
router.use("/license", businessLicenseRoutes);


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



// =========================
// AI MODULE
// =========================
console.log("🧭 /ai routes loaded");
// router.use("/ai", commenRoutes);  // /stations/ai-config to return for the ai the all config infomation for the all station
// app.post("/ai/update", async (req, res) => {
//     const data = req.body;
  
//     await db.collection("station_ai").updateOne(
//       { station_id: data.station_id },
//       { $set: data },
//       { upsert: true }
//     );
  
//     res.json({ success: true });
//   });
// GET /stations/:id/config
// POST /ai/result
// GET /stations/:id/live

// [
//     {
//       "id": "S1",
//       "cameraUrl": "rtsp://192.168.1.10/stream",
//       "roi": [100, 200, 800, 600],
//       "thresholds": { "low": 3, "medium": 7 }
//     },
//     {
//       "id": "S2",
//       "cameraUrl": "rtsp://192.168.1.11/stream",
//       "roi": [120, 220, 700, 580],
//       "thresholds": { "low": 2, "medium": 5 }
//     }
//   ]

// here is all public user side routes 
// camera related route
console.log("🧭 /public/stations routes loaded");
router.use("/public/stations", publicSationsRoutes);
router.use("/public/vehicles", publicvehiclesRoutes);
router.use("/public/fuelrequests", publicfuelRequestRoutes);
router.use("/public/fueltransactions", publicfuelRequestRoutes);
console.log("🧭 /public/license routes loaded");
router.use("/public/license", publicLicenseRoutes);



export default router;