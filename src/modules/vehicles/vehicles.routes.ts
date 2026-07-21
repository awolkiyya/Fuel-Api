import { Router } from "express";
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  getMyVehicles,
  updateVehicle,
  deactivateVehicle,
  activateVehicle,
  deleteVehicle,
} from "./vehicles.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../../schemas/vehicles.schema";

const router = Router();

// =====================================================
// CREATE
// =====================================================
router.post(
  "/",
  authMiddleware,
  validate(createVehicleSchema),
  createVehicle
);

// =====================================================
// READ
// =====================================================
router.get("/", authMiddleware, getVehicles);
router.get("/me", authMiddleware, getMyVehicles);
router.get("/:id", authMiddleware, getVehicleById);

// =====================================================
// UPDATE (business data)
// =====================================================
router.put(
  "/:id",
  authMiddleware,
  validate(updateVehicleSchema),
  updateVehicle
);

// =====================================================
// LIFECYCLE ACTIONS
// =====================================================

// deactivate
router.patch(
  "/:id/deactivate",
  authMiddleware,
  deactivateVehicle
);

// activate
router.patch(
  "/:id/activate",
  authMiddleware,
  activateVehicle
);

// delete (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  deleteVehicle
);

export default router;