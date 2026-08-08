import { Request, Response } from "express";

import { vehicleService } from "./vehicles.service";
import { VehicleResource } from "./vehicle.resource";

import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../../schemas/vehicles.schema";

// =====================================================
// TYPES
// =====================================================

type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

// =====================================================
// CREATE VEHICLE
// =====================================================
//
// Request:
// multipart/form-data
//
// Fields:
// - vehicleTypeId
// - regionCode
// - plateNumber
// - vin
// - fuelCapacity
// - fuelTypeId
// - ownershipNumber
// - document
//
// Creates:
// - Vehicle
// - VehicleOwnershipDocument
// =====================================================

export const createVehicle = async (
  req: Request,
  res: Response
) => {

  const userId = (req as any).user?.id;

  if (!userId) {
    const error: any =
      new Error("Unauthorized");

    error.code = "UNAUTHORIZED";
    error.statusCode = 401;

    throw error;
  }


  // =====================================================
  // DOCUMENT REQUIRED
  // =====================================================

  if (!req.file) {

    const error: any =
      new Error(
        "Vehicle ownership document is required"
      );

    error.code =
      "OWNERSHIP_DOCUMENT_REQUIRED";

    error.statusCode = 400;

    throw error;
  }


  // =====================================================
  // VALIDATE BODY
  // =====================================================

  const validatedData =
    createVehicleSchema.parse(req.body);


  // =====================================================
  // DOCUMENT URL
  // =====================================================

  const documentUrl =
    req.file.path;


  // =====================================================
  // CREATE
  // =====================================================

  const vehicle =
    await vehicleService.createVehicle(
      {
        ...validatedData,
        userId,
      },
      documentUrl
    );


  return res.status(201).json({
    success: true,
    message:
      "Vehicle created successfully",

    data: vehicle,
  });
};

// =====================================================
// UPDATE VEHICLE
// =====================================================
//
// Document is OPTIONAL during update.
//
// If no document:
//   → update vehicle only
//   → keep existing ownership document
//
// If document exists:
//   → update existing ownership document
//   → status = PENDING
//   → vehicle verification resets
// =====================================================

// =====================================================
// UPDATE VEHICLE
// =====================================================

export const updateVehicle = async (
  req: AuthRequest,
  res: Response
) => {
  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const userId = req.user?.id;

  if (!userId) {
    const error: any = new Error("Unauthorized");

    error.code = "UNAUTHORIZED";
    error.statusCode = 401;

    throw error;
  }

  // ===================================================
  // VEHICLE ID
  // ===================================================

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!id) {
    const error: any = new Error(
      "Vehicle ID is required"
    );

    error.code = "VEHICLE_ID_REQUIRED";
    error.statusCode = 400;

    throw error;
  }

  // ===================================================
  // VALIDATE VEHICLE DATA
  // ===================================================

  const validatedData =
    updateVehicleSchema.parse(req.body);

  // ===================================================
  // OPTIONAL OWNERSHIP DOCUMENT
  // ===================================================

  const document = req.file;

  // ===================================================
  // OPTIONAL DOCUMENT METADATA
  // ===================================================

  const ownershipNumber =
    typeof req.body.ownershipNumber === "string"
      ? req.body.ownershipNumber.trim()
      : undefined;

  // ===================================================
  // UPDATE VEHICLE
  // ===================================================

  const vehicle =
    await vehicleService.updateVehicle(
      id,
      userId,
      {
        data: validatedData,
        document,
        ownershipNumber,
      }
    );

  // ===================================================
  // RESPONSE
  // ===================================================

  return res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    data: VehicleResource.toResponse(vehicle),
    code: "VEHICLE_UPDATED",
  });
};


// =====================================================
// GET ALL VEHICLES
// =====================================================

export const getVehicles = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    const page = Math.max(
      parseInt(req.query.page as string) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit as string) || 10,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    // ASC or DESC
    const order =
      (req.query.order as string)?.toLowerCase() === "asc"
        ? "asc"
        : "desc";

    const { vehicles, meta } =
      await vehicleService.getAllVehicles({
        userId,
        skip,
        take: limit,
        page,
        order,
      });

    return res.json({
      success: true,
      message: "Vehicles fetched successfully",
      data: VehicleResource.toResponseList(vehicles),
      meta,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      code: err.code || "ERROR",
    });
  }
};

// =====================================================
// GET VEHICLE BY ID
// =====================================================

export const getVehicleById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
        code: "VEHICLE_ID_REQUIRED",
      });
    }

    const vehicle =
      await vehicleService.getVehicleById(id);

    return res.json({
      success: true,
      message: "Vehicle fetched successfully",
      data: VehicleResource.toResponse(vehicle),
    });
  } catch (err: any) {
    return res.status(err.statusCode || 404).json({
      success: false,
      message: err.message || "Vehicle not found",
      code: err.code || "VEHICLE_NOT_FOUND",
    });
  }
};

// =====================================================
// GET MY VEHICLES
// =====================================================

export const getMyVehicles = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const vehicles =
      await vehicleService.getUserVehicles(userId);

    return res.json({
      success: true,
      message: "User vehicles fetched successfully",
      data: VehicleResource.toResponseList(vehicles),
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      code: err.code || "ERROR",
    });
  }
};

// =====================================================
// DEACTIVATE VEHICLE
// =====================================================

export const deactivateVehicle = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      const error: any = new Error("Vehicle ID is required");
      error.code = "VEHICLE_ID_REQUIRED";
      error.statusCode = 400;
      throw error;
    }

    const result =
      await vehicleService.deactivateVehicle(
        id,
        userId
      );

    return res.json({
      success: true,
      message: "Vehicle deactivated successfully",
      data: result,
      code: "VEHICLE_DEACTIVATED",
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      code: err.code || "ERROR",
    });
  }
};

// =====================================================
// ACTIVATE VEHICLE
// =====================================================

export const activateVehicle = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      const error: any = new Error("Vehicle ID is required");
      error.code = "VEHICLE_ID_REQUIRED";
      error.statusCode = 400;
      throw error;
    }

    const result =
      await vehicleService.activateVehicle(
        id,
        userId
      );

    return res.json({
      success: true,
      message: "Vehicle activated successfully",
      data: result,
      code: "VEHICLE_ACTIVATED",
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      code: err.code || "ERROR",
    });
  }
};

// =====================================================
// DELETE VEHICLE
// =====================================================

export const deleteVehicle = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      const error: any = new Error("Vehicle ID is required");
      error.code = "VEHICLE_ID_REQUIRED";
      error.statusCode = 400;
      throw error;
    }

    const result =
      await vehicleService.deleteVehicle(
        id,
        userId
      );

    return res.json({
      success: true,
      message: "Vehicle deleted successfully",
      data: result,
      code: "VEHICLE_DELETED",
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal server error",
      code: err.code || "ERROR",
    });
  }
};