import { Request, Response } from "express";
import { vehicleService } from "./vehicles.service";
import { VehicleResource } from "./vehicle.resource";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../../schemas/vehicles.schema";

// ========================
// TYPES
// ========================
type IdParams = {
  id: string;
};

type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

// ========================
// CREATE VEHICLE
// ========================
export const createVehicle = async (req: Request, res: Response) => {
  const validatedData = createVehicleSchema.parse(req.body);

  const userId = (req as any).user?.id;

  if (!userId) {
    const error: any = new Error("Unauthorized");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }

  const vehicle = await vehicleService.createVehicle({
    ...validatedData,
    userId,
  });

  return res.status(201).json({
    success: true,
    message: "Vehicle created successfully",
    data: vehicle,
  });
};

// ========================
// UPDATE VEHICLE
// ========================
export const updateVehicle = async (req: Request, res: Response) => {
  const validatedData = updateVehicleSchema.parse(req.body);

  const userId = (req as any).user?.id;

  if (!userId) {
    const error: any = new Error("Unauthorized");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }


  // ================= VEHICLE ID =================
  const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

  
  if (!id) {
    const error: any = new Error("Vehicle ID is required");
    error.code = "VEHICLE_ID_REQUIRED";
    error.statusCode = 400;
    throw error;
  }

  const vehicle = await vehicleService.updateVehicle(
    id,
    userId,
    validatedData
  );

  return res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    data: vehicle,
    code: "VEHICLE_UPDATED",
  });
};

// ========================
// GET ALL VEHICLES
// ========================
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // ========================
    // ORDER HANDLING (ASC / DESC)
    // ========================
    const order =
      (req.query.order as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const { vehicles, meta } = await vehicleService.getAllVehicles({
      userId,
      skip,
      take: limit,
      page,
      order, // 👈 pass to service
    });

    return res.json({
      success: true,
      message: "Vehicles fetched successfully",
      data: VehicleResource.toResponseList(vehicles),
      meta,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ========================
// GET VEHICLE BY ID
// ========================
export const getVehicleById = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const vehicle = await vehicleService.getVehicleById(id);

    return res.json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (err: any) {
    const error: any = new Error(err.message || "Vehicle not found");
    error.code = "VEHICLE_NOT_FOUND";
    error.statusCode = 404;

    throw error;
  }
};

// ========================
// GET MY VEHICLES
// ========================
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

    const vehicles = await vehicleService.getUserVehicles(userId);

    return res.json({
      success: true,
      message: "User vehicles fetched successfully",
      data: vehicles,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

// ========================
// DEACTIVATE VEHICLE
// ========================
export const deactivateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // ================= VEHICLE ID =================
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  
    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const result = await vehicleService.deactivateVehicle(id, userId);

    return res.json({
      success: true,
      message: "Vehicle deactivated successfully",
      data: result,
      code: "VEHICLE_DEACTIVATED",
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code || "ERROR",
    });
  }
};

// ========================
// ACTIVATE VEHICLE
// ========================
export const activateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // ================= VEHICLE ID =================
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  
    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const result = await vehicleService.activateVehicle(id, userId);

    return res.json({
      success: true,
      message: "Vehicle activated successfully",
      data: result,
      code: "VEHICLE_ACTIVATED",
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code || "ERROR",
    });
  }
};

// ========================
// DELETE VEHICLE (SOFT DELETE)
// ========================
export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // ================= VEHICLE ID =================
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  
    if (!userId) {
      const error: any = new Error("Unauthorized");
      error.code = "UNAUTHORIZED";
      error.statusCode = 401;
      throw error;
    }

    const result = await vehicleService.deleteVehicle(id, userId);

    return res.json({
      success: true,
      message: "Vehicle deleted successfully",
      data: result,
      code: "VEHICLE_DELETED",
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code || "ERROR",
    });
  }
};