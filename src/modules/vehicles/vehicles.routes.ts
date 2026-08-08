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
import upload from "../../middlewares/upload.middleware";

import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../../schemas/vehicles.schema";

const router = Router();

// =====================================================
// CREATE VEHICLE
// =====================================================
// multipart/form-data
//
// Fields:
// - plateNumber
// - vin
// - fuelCapacity
// - vehicleTypeId
// - fuelTypeId
// - regionCode
//
// File:
// - document
// =====================================================

router.post(
  "/",
  authMiddleware,
  upload.single("document"),
  validate(createVehicleSchema),
  createVehicle
);

// =====================================================
// READ
// =====================================================

router.get(
  "/",
  authMiddleware,
  getVehicles
);

router.get(
  "/me",
  authMiddleware,
  getMyVehicles
);

router.get(
  "/:id",
  authMiddleware,
  getVehicleById
);

// =====================================================
// UPDATE VEHICLE
// =====================================================
// Document is OPTIONAL.
//
// No document:
//   → update vehicle fields only
//   → keep existing ownership document
//
// New document:
//   → replace ownership document
//   → reset document verification to PENDING
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  upload.single("document"),
  validate(updateVehicleSchema),
  updateVehicle
);

// =====================================================
// LIFECYCLE
// =====================================================

// Deactivate
router.patch(
  "/:id/deactivate",
  authMiddleware,
  deactivateVehicle
);

// Activate
router.patch(
  "/:id/activate",
  authMiddleware,
  activateVehicle
);

// Soft delete
router.delete(
  "/:id",
  authMiddleware,
  deleteVehicle
);

export default router;