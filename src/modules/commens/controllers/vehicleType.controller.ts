import { Request, Response } from "express";
import { sendResponse } from "../../../utils/apiResponse";

import { VehicleTypeService } from "../services/vehicleType.service";
import { VehicleTypeResource } from "../resources/vehicleType.resources";
import prisma from "../../../config/db";

/* -----------------------------
   LIST VEHICLE TYPES
------------------------------ */
export const listVehicleType = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const status = req.query.status as "ACTIVE" | "INACTIVE" | undefined;
  const search = req.query.search as string | undefined;

  const result = await VehicleTypeService.list(page, limit, status, search);

  return sendResponse(res, {
    statusCode: 200,
    message: "Vehicle types fetched successfully",
    data: VehicleTypeResource.toResponseList(result.items),
    meta: result.meta,
  });
};

/* -----------------------------
   CREATE VEHICLE TYPE
------------------------------ */
export const addVehicleType = async (req: Request, res: Response) => {
  const validated = req.body;

  const result = await VehicleTypeService.create(validated);

  return sendResponse(res, {
    statusCode: 201,
    message: "Vehicle type created successfully",
    data: VehicleTypeResource.toResponse(result),
  });
};

/* -----------------------------
   UPDATE VEHICLE TYPE
------------------------------ */
export const updateVehicleType = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const result = await VehicleTypeService.update(id, req.body);

  return sendResponse(res, {
    statusCode: 200,
    message: "Vehicle type updated successfully",
    data: VehicleTypeResource.toResponse(result),
  });
};

/* -----------------------------
   TOGGLE STATUS
------------------------------ */
export const updateVehicleTypeStatus = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  const { status } = req.body; // "active" | "inactive"

  const result = await VehicleTypeService.updateStatus(id, status);

  return sendResponse(res, {
    statusCode: 200,
    message: "Vehicle type status updated successfully",
    data: VehicleTypeResource.toResponse(result),
  });
};

export const listVehicleTypeWithFuelTypes = async (req: Request, res: Response) => {
    const vehicleTypes = await prisma.vehicleType.findMany({
      include: {
        allowedFuelTypes: true,
      },
    });

    return sendResponse(res, {
      statusCode: 200,
      message: "Vehicle types with fuel types fetched  successfully",
      data: VehicleTypeResource.toResponseList(vehicleTypes),
    });      

};