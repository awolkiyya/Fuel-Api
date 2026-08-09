import { Request, Response, NextFunction } from "express";

import { quotaService } from "./quota.service";

import {
  createQuotaSchema,
  updateQuotaSchema,
  approveQuotaSchema,
  cancelQuotaSchema,
  getQuotasSchema,
  quotaIdSchema,
  getActiveQuotaSchema,
} from "./quota.schema";

// =====================================================
// HELPERS
// =====================================================

/**
 * Extract and validate quota ID from route params.
 */
const getQuotaId = (req: Request): string => {
  return quotaIdSchema.parse(req.params).id;
};

// =====================================================
// CREATE QUOTA
// =====================================================

export const createQuota = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createQuotaSchema.parse(req.body);

    const quota = await quotaService.create(data);

    return res.status(201).json({
      success: true,
      message: "Fuel quota created successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET QUOTAS
// =====================================================

export const getQuotas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getQuotasSchema.parse(req.query);

    const result = await quotaService.getAll(query);

    return res.status(200).json({
      success: true,
      message: "Fuel quotas retrieved successfully.",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET QUOTA BY ID
// =====================================================

export const getQuotaById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getQuotaId(req);

    const quota = await quotaService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Fuel quota retrieved successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE QUOTA
// =====================================================

export const updateQuota = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getQuotaId(req);

    const data = updateQuotaSchema.parse(req.body);

    const quota = await quotaService.update(id, data);

    return res.status(200).json({
      success: true,
      message: "Fuel quota updated successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// APPROVE QUOTA
// =====================================================

export const approveQuota = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getQuotaId(req);

    const data = approveQuotaSchema.parse(req.body);

    const quota = await quotaService.approve(id, data);

    return res.status(200).json({
      success: true,
      message: "Fuel quota approved successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CANCEL QUOTA
// =====================================================

export const cancelQuota = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getQuotaId(req);

    const data = cancelQuotaSchema.parse(req.body);

    const quota = await quotaService.cancel(id, data);

    return res.status(200).json({
      success: true,
      message: "Fuel quota cancelled successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ACTIVE QUOTA
// =====================================================
//
// GET /quotas/active
//
// Query:
// ?organizationId=...
// &fuelTypeId=...
// &date=2026-08-09
//
// =====================================================

export const getActiveQuota = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getActiveQuotaSchema.parse(req.query);

    const quota = await quotaService.getActiveQuota(query);

    return res.status(200).json({
      success: true,
      message:
        "Active fuel quota retrieved successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// REFRESH QUOTA STATUS
// =====================================================
//
// POST /quotas/:id/refresh-status
//
// Used to recalculate:
// - ACTIVE
// - EXHAUSTED
// - EXPIRED
//
// CANCELLED is never automatically changed.
//
// =====================================================

export const refreshQuotaStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getQuotaId(req);

    const quota =
      await quotaService.refreshStatus(id);

    return res.status(200).json({
      success: true,
      message:
        "Fuel quota status refreshed successfully.",
      data: quota,
    });
  } catch (error) {
    next(error);
  }
};