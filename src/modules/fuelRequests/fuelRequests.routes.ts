import { Router } from "express";
import {
  createFuelRequest,
  approveFuelRequest,
  getFuelRequests,
} from "./fuelRequests.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

import {
  createFuelRequestSchema,
  approveFuelRequestSchema,
  idParamSchema,
} from "../../schemas/fuelRequests.schema";

const router = Router();

// CREATE (VALIDATED)
router.post(
  "/",
  authMiddleware,
  validate(createFuelRequestSchema),
  createFuelRequest
);

// GET
router.get("/", authMiddleware, getFuelRequests);

// APPROVE (VALIDATED)
router.patch(
  "/:id/approve",
  authMiddleware,
  validate(idParamSchema),        // params
  validate(approveFuelRequestSchema), // body
  approveFuelRequest
);

export default router;