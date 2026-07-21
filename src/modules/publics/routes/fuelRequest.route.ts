import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import {
  cancelFuelRequest,
  createFuelRequest,
  getFuelRequestById,
  getMyActiveFuelRequests,
  getMyFuelRequests,
} from "../controllers/fuelRequest.controller";
import { riskMiddleware } from "../../../middlewares/risk.middleware";

const router = Router();

/* =========================
   DRIVER FUEL REQUEST ROUTES
========================= */

/**
 * POST /api/v1/driver/fuel-requests
 * Create new fuel request
 */
router.post(
  "/",
  authMiddleware,
  riskMiddleware,
  createFuelRequest
);

/**
 * GET /api/v1/driver/fuel-requests/active
 * Get active fuel request of logged-in driver
 */
router.get(
  "/active",
  authMiddleware,
  getMyActiveFuelRequests
);

/**
 * GET /api/v1/driver/fuel-requests/my
 * Get all fuel requests of logged-in driver
 */
router.get(
  "/my",
  authMiddleware,
  getMyFuelRequests
);

/**
 * GET /api/v1/driver/fuel-requests/:id
 * Get single fuel request details
 */
router.get(
  "/:id",
  authMiddleware,
  getFuelRequestById
);

/**
 * PATCH /api/v1/driver/fuel-requests/:id/cancel
 * Cancel fuel request (if still pending)
 */
router.post(
  "/:id/cancel",
  authMiddleware,
  cancelFuelRequest
);

export default router;