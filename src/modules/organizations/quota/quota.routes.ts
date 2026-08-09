import { Router } from "express";

import {
  createQuota,
  getQuotas,
  getQuotaById,
  updateQuota,
  approveQuota,
  cancelQuota,
  getActiveQuota,
  refreshQuotaStatus,
} from "./quota.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";


const router = Router();


// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);


// =====================================================
// QUOTA LIST
// =====================================================

// GET /api/organizations/quotas
//
// Supported query parameters:
//
// ?page=1
// &limit=10
// &organizationId=...
// &fuelTypeId=...
// &periodType=MONTHLY
// &status=ACTIVE
// &startDate=...
// &endDate=...

router.get(
  "/",
  getQuotas,
);


// =====================================================
// ACTIVE QUOTA
// =====================================================

// GET /api/organizations/quotas/active
//
// Example:
//
// /quotas/active?organizationId=...&fuelTypeId=...

router.get(
  "/active",
  getActiveQuota,
);


// =====================================================
// CREATE QUOTA
// =====================================================

// POST /api/organizations/quotas

router.post(
  "/",
  createQuota,
);


// =====================================================
// GET QUOTA BY ID
// =====================================================

// GET /api/organizations/quotas/:id

router.get(
  "/:id",
  getQuotaById,
);


// =====================================================
// UPDATE QUOTA
// =====================================================

// PATCH /api/organizations/quotas/:id

router.patch(
  "/:id",
  updateQuota,
);


// =====================================================
// APPROVE QUOTA
// =====================================================

// POST /api/organizations/quotas/:id/approve

router.post(
  "/:id/approve",
  approveQuota,
);


// =====================================================
// CANCEL QUOTA
// =====================================================

// POST /api/organizations/quotas/:id/cancel

router.post(
  "/:id/cancel",
  cancelQuota,
);


// =====================================================
// REFRESH STATUS
// =====================================================

// POST /api/organizations/quotas/:id/refresh-status

router.post(
  "/:id/refresh-status",
  refreshQuotaStatus,
);


export default router;