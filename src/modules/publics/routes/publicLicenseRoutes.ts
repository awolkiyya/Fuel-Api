import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { checkBusinessLicenseBanner } from "../controllers/license.controller";

const router = Router();

/**
 * =====================================================
 * 🚨 HOME BANNER LICENSE CHECK
 * =====================================================
 */
router.get(
  "/banner",
  authMiddleware,
  checkBusinessLicenseBanner
);

export default router;