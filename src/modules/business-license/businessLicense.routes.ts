import { Router } from "express";
import { BusinessLicenseController } from "./businessLicense.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

/**
 * =========================
 * CREATE LICENSE
 * =========================
 */
router.post(
  "/",
  authMiddleware,
  upload.single("document"),
  BusinessLicenseController.create
);

/**
 * =========================
 * GET MY LICENSE
 * =========================
 */
router.get(
  "/me",
  authMiddleware,
  BusinessLicenseController.getMyLicense
);

/**
 * =========================
 * UPDATE LICENSE (FULL EDIT)
 * =========================
 * - can update licenseNumber + expiryDate + optional file
 */
router.post(
  "/me",
  authMiddleware,
  upload.single("document"),
  BusinessLicenseController.update
);

/**
 * =========================
 * RENEW LICENSE (DOCUMENT ONLY)
 * =========================
 */
router.post(
  "/me/renew",
  authMiddleware,
  upload.single("document"),
  BusinessLicenseController.renewRequest
);

export default router;