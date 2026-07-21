import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { getNearbyStations, getStationById, getStationFuels, searchStations } from "../controllers/stations.controller";


const router = Router();

/* =========================
   DRIVER ROUTES (PUBLIC/PROTECTED MIX)
========================= */

/**
 * GET /api/v1/driver/stations/nearby
 * Nearby stations with AI traffic + fuel + distance
 */
router.get(
  "/nearby",
  authMiddleware,
  getNearbyStations
);

/**
 * GET /api/v1/driver/stations/search
 * Search stations by name, city, region
 */
router.get(
  "/search",
  authMiddleware,
  searchStations
);

/**
 * GET /api/v1/driver/stations/:id
 * Full station detail (fuel + traffic + location)
 */
router.get(
  "/:id",
  authMiddleware,
  getStationById
);


/**
 * GET /api/v1/driver/stations/:id/fuels
 * Fuel prices, stock %, availability per fuel type
 */
router.get(
  "/:id/fuels",
  authMiddleware,
  getStationFuels
);

export default router;