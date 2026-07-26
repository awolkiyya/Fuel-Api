import { Router } from "express";
import { BusinessLicenseController } from "./businessLicense.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();

/**
 * =====================================
 * USER ROUTES
 * =====================================
 */

// Create new license
router.post(
  "/",
  authMiddleware,
  upload.single("document"),
  BusinessLicenseController.create
);

// Get my license
router.get(
  "/me",
  authMiddleware,
  BusinessLicenseController.getMyLicense
);

// Update my license
router.post(
  "/me",
  authMiddleware,
  upload.single("document"),
  BusinessLicenseController.update
);

// Submit renewal request
router.post(
  "/me/renew",
  authMiddleware,
  upload.single("document"),
  BusinessLicenseController.renewRequest
);

/**
 * =====================================
 * ADMIN ROUTES
 * =====================================
 */

// List all licenses
router.get(
  "/admin",
  authMiddleware,
  BusinessLicenseController.getAll
);

// Get single license
router.get(
  "/admin/:id",
  authMiddleware,
  BusinessLicenseController.getById
);

// Approve
router.patch(
  "/admin/:id/approve",
  authMiddleware,
  BusinessLicenseController.approve
);

// Reject
router.patch(
  "/admin/:id/reject",
  authMiddleware,
  BusinessLicenseController.reject
);

export default router;