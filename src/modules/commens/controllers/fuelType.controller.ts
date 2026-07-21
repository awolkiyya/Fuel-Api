import { Request, Response } from "express";
import { sendResponse } from "../../../utils/apiResponse";
import { FuelTypeService } from "../services/commen.service";
import { FuelTypeResource } from "../resources/fuelType.resources";

/**
 * LIST
 */
export const listFuelType = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const status = req.query.status as "ACTIVE" | "INACTIVE" | undefined;
  const search = req.query.search as string | undefined;

  const result = await FuelTypeService.list(page, limit, status, search);

  return sendResponse(res, {
    statusCode: 200,
    message: "Fuel types fetched successfully",
    data: FuelTypeResource.toResponseList(result.items),
    meta: result.meta,
  });
};

/**
 * CREATE
 */
export const addFuelType = async (req: Request, res: Response) => {
  const validated = req.body;

  const result = await FuelTypeService.create(validated);

  return sendResponse(res, {
    statusCode: 201,
    message: "Fuel type created successfully",
    data: FuelTypeResource.toResponse(result),
  });
};

/**
 * UPDATE
 */
export const updateFuelType = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
  
      const result = await FuelTypeService.update(id, req.body);
  
      return sendResponse(res, {
        statusCode: 200,
        message: "Fuel type updated successfully",
        data: FuelTypeResource.toResponse(result),
      });
};

export const updateFuelStatus = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    const { status } = req.body; // "ACTIVE" | "INACTIVE"

    const result = await FuelTypeService.updateStatus(id, status);

    return sendResponse(res, {
      statusCode: 200,
      message: "Fuel status updated successfully",
      data: FuelTypeResource.toResponse(result),
    });
};


