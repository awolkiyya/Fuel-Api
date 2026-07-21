import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

import {
  getMyProfile,
  updateProfile,
} from "./onboarding.controller";

import { updateProfileSchema } from "../../schemas/onboarding.schema";

const router = Router();

// =========================
// GET PROFILE
// =========================
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

// =========================
// UPDATE ONBOARDING PROFILE
// =========================
router.put(
  "/complete",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile
);

export default router;