import { Router } from "express";

import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  updateOrganizationStatus,
  updateOrganizationFuelAccess,
  updateOrganizationFuelPolicy,
} from "./organizations.controller";

const router = Router();

// =====================================================
// ORGANIZATION MANAGEMENT
// =====================================================

// GET /api/organizations
// List organizations with pagination, search and filters.
router.get("/", getOrganizations);

// POST /api/organizations
// Create a new organization.
router.post("/", createOrganization);

// GET /api/organizations/:id
// Get a single organization.
router.get("/:id", getOrganizationById);

// PATCH /api/organizations/:id
// Update organization information.
router.patch("/:id", updateOrganization);

// DELETE /api/organizations/:id
// Delete organization.
router.delete("/:id", deleteOrganization);


// =====================================================
// ORGANIZATION STATUS
// =====================================================

// PATCH /api/organizations/:id/status
// Activate, deactivate, suspend or block an organization.
router.patch(
  "/:id/status",
  updateOrganizationStatus,
);


// =====================================================
// FUEL ACCESS CONTROL
// =====================================================

// PATCH /api/organizations/:id/fuel-access
// Enable or disable fuel access.
router.patch(
  "/:id/fuel-access",
  updateOrganizationFuelAccess,
);


// =====================================================
// FUEL POLICY
// =====================================================

// PATCH /api/organizations/:id/fuel-policy
// Update quota requirement and maximum transaction limit.
router.patch(
  "/:id/fuel-policy",
  updateOrganizationFuelPolicy,
);


export default router;