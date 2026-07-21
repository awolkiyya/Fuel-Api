import { Router } from "express";

import { authMiddleware } from "../../../middlewares/auth.middleware";
import { getDriverActiveVehicleCard } from "../controllers/driverVehicle.controller";

const router = Router();

/* =========================
   DRIVER HOME VEHICLE CARD
========================= */

/**
 * GET /api/v1/driver/vehicles/home
 * Returns active vehicle + daily usage summary for home screen card
 */
router.get(
  "/home",
  authMiddleware,
  getDriverActiveVehicleCard
);

export default router;