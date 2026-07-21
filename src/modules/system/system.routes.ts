import { Router } from "express"
import { authMiddleware } from "../../middlewares/auth.middleware"
import { validate } from "../../middlewares/validate.middleware"

import { getSystemSettings, resetSystemSettings, updateSystemSettings } from "./system.controller"
import { updateSystemSettingsSchema } from "../../schemas/systemSettingsRequest"

const router = Router()

/* --------------------------------
   SYSTEM SETTINGS ROUTES
--------------------------------- */

/**
 * GET GLOBAL SYSTEM SETTINGS
 * (admin + system consumption)
 */
router.get(
  "/system-settings",
  authMiddleware,
  getSystemSettings
)

/**
 * UPDATE SYSTEM SETTINGS (PARTIAL PATCH)
 */
router.patch(
  "/system-settings",
  authMiddleware,
  validate(updateSystemSettingsSchema),
  updateSystemSettings
)

/**
 * RESET SYSTEM SETTINGS TO DEFAULTS
 */
router.post(
  "/system-settings/reset",
  authMiddleware,
  resetSystemSettings
)

export default router