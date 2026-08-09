import { Request, Response, NextFunction } from "express";

import { organizationService } from "./organizations.service";

import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateOrganizationStatusSchema,
  updateOrganizationFuelAccessSchema,
  updateOrganizationFuelPolicySchema,
  getOrganizationsSchema,
  organizationIdSchema,
} from "./organizations.schema";


// =====================================================
// HELPERS
// =====================================================

const getOrganizationId = (
  req: Request,
): string => {
  return organizationIdSchema.parse(req.params).id;
};


// =====================================================
// CREATE ORGANIZATION
// =====================================================

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const data =
      createOrganizationSchema.parse(req.body);


    const organization =
      await organizationService.create(data);


    return res.status(201).json({
      success: true,

      message:
        "Organization created successfully.",

      data: organization,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET ORGANIZATIONS
// =====================================================

export const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const query =
      getOrganizationsSchema.parse(req.query);


    const result =
      await organizationService.getAll(query);


    return res.status(200).json({
      success: true,

      message:
        "Organizations retrieved successfully.",

      data: result.data,

      meta: result.meta,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET ORGANIZATION BY ID
// =====================================================

export const getOrganizationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const id =
      getOrganizationId(req);


    const organization =
      await organizationService.getById(id);


    return res.status(200).json({
      success: true,

      message:
        "Organization retrieved successfully.",

      data: organization,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE ORGANIZATION
// =====================================================

export const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const id =
      getOrganizationId(req);


    const data =
      updateOrganizationSchema.parse(
        req.body,
      );


    const organization =
      await organizationService.update(
        id,
        data,
      );


    return res.status(200).json({
      success: true,

      message:
        "Organization updated successfully.",

      data: organization,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE ORGANIZATION STATUS
// =====================================================

export const updateOrganizationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const id =
      getOrganizationId(req);


    const data =
      updateOrganizationStatusSchema.parse(
        req.body,
      );


    const organization =
      await organizationService.updateStatus(
        id,
        data,
      );


    return res.status(200).json({
      success: true,

      message:
        "Organization status updated successfully.",

      data: organization,
    });

  } catch (error) {
    next(error);
  }
};


// =====================================================
// UPDATE FUEL ACCESS
// =====================================================

export const updateOrganizationFuelAccess =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {

      const id =
        getOrganizationId(req);


      const data =
        updateOrganizationFuelAccessSchema.parse(
          req.body,
        );


      const organization =
        await organizationService.updateFuelAccess(
          id,
          data,
        );


      return res.status(200).json({
        success: true,

        message:
          "Organization fuel access updated successfully.",

        data: organization,
      });

    } catch (error) {
      next(error);
    }
  };


// =====================================================
// UPDATE FUEL POLICY
// =====================================================

export const updateOrganizationFuelPolicy =
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {

      const id =
        getOrganizationId(req);


      const data =
        updateOrganizationFuelPolicySchema.parse(
          req.body,
        );


      const organization =
        await organizationService.updateFuelPolicy(
          id,
          data,
        );


      return res.status(200).json({
        success: true,

        message:
          "Organization fuel policy updated successfully.",

        data: organization,
      });

    } catch (error) {
      next(error);
    }
  };


// =====================================================
// DELETE ORGANIZATION
// =====================================================

export const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const id =
      getOrganizationId(req);


    const result =
      await organizationService.delete(id);


    return res.status(200).json({
      success: true,

      message:
        result.message,
    });

  } catch (error) {
    next(error);
  }
};