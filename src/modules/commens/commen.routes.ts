import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createFuelTypeSchema,
  paramsSchema,
  updateFuelTypeSchema,
  updateFuelStatusSchema, // 👈 add this
} from "../../schemas/fuelTypeRequest";
import {
  addFuelType,
  listFuelType,
  updateFuelType,
  updateFuelStatus, // 👈 add this
} from "./controllers/fuelType.controller";
import { updateVehicleTypeStatusSchema, vehicleParamsSchema, VehicleTypeCreateSchema, VehicleTypeUpdateSchema } from "../../schemas/vehicleTypeRequest";
import { addVehicleType, listVehicleType, listVehicleTypeWithFuelTypes, updateVehicleType, updateVehicleTypeStatus } from "./controllers/vehicleType.controller";

const router = Router();

/* -----------------------------
   FUEL TYPE ROUTES
------------------------------ */

// LIST
router.get("/fuelTypes", authMiddleware, listFuelType);

// CREATE
router.post(
  "/fuelTypes",
  authMiddleware,
  validate(createFuelTypeSchema),
  addFuelType
);

// UPDATE FULL FUEL
router.patch(
  "/fuelTypes/:id",
  authMiddleware,
  validate(paramsSchema, "params"),
  validate(updateFuelTypeSchema),
  updateFuelType
);

// ✅ STATUS ONLY UPDATE (NEW ROUTE)
router.patch(
  "/fuelTypes/:id/toggle-status",
  authMiddleware,
  validate(paramsSchema, "params"),
  validate(updateFuelStatusSchema),
  updateFuelStatus
);

/* --------------------------------
   VEHICLE TYPE ROUTES
--------------------------------- */

/**
 * LIST VEHICLE TYPES
 * supports: search, pagination, status filter
 */
router.get(
  "/vehicleTypes",
  authMiddleware,
  listVehicleType
);

/**
 * CREATE VEHICLE TYPE
 */
router.post(
  "/vehicleTypes",
  authMiddleware,
  validate(VehicleTypeCreateSchema),
  addVehicleType
);

/**
 * UPDATE VEHICLE TYPE (FULL UPDATE)
 */
router.patch(
  "/vehicleTypes/:id",
  authMiddleware,
  validate(vehicleParamsSchema, "params"),
  validate(VehicleTypeUpdateSchema),
  updateVehicleType
);

/**
 * UPDATE STATUS ONLY (ACTIVE / INACTIVE)
 */
router.patch(
  "/vehicleTypes/:id/toggle-status",
  authMiddleware,
  validate(vehicleParamsSchema, "params"),
  validate(updateVehicleTypeStatusSchema),
  updateVehicleTypeStatus
);

router.get(
  "/vehicleTypes/with-fuelTypes",
  authMiddleware,
  listVehicleTypeWithFuelTypes
);

export default router;