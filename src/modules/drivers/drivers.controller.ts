import { Request, Response } from "express"

import { getPagination } from "../../utils/pagination"
import { driverService } from "./drivers.service"
import { sendResponse } from "../../utils/apiResponse"
import { sendError } from "../../utils/apiError"
import { driverResource } from "./drivers.resource"

// GET ALL DRIVERS
export const getDrivers = async (req: Request, res: Response) => {
    try {
      const { page, limit, skip } = getPagination(req.query)
  
      const search = (req.query.search as string) || ""
      const status = (req.query.status as string) || ""
      const riskLevel = (req.query.riskLevel as string) || ""
  
      /* NEW: vehicle filter */
      const vehicleFilter =
        (req.query.vehicleFilter as "single" | "multiple" | "all") || "all"
  
      const result = await driverService.getAllDrivers({
        page,
        limit,
        skip,
        search,
        status,
        riskLevel,
        vehicleFilter,
      })
  
      return sendResponse(res, {
        message: "Drivers fetched successfully",
        data: result.data.map(driverResource),
        meta: result.meta,
      })
  
    } catch (err: any) {
      return sendError(res, {
        message: err.message,
      })
    }
  }

// GET DRIVER BY ID
export const getDriverById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
  
      /* -----------------------------
         VALIDATE PARAM SAFELY
      ------------------------------ */
      if (!id || Array.isArray(id)) {
        return sendError(res, {
          message: "Invalid driver id",
          statusCode: 400,
        })
      }
  
      const driver = await driverService.getDriverById(id)
  
      if (!driver) {
        return sendError(res, {
          message: "Driver not found",
          statusCode: 404,
        })
      }
  
      return sendResponse(res, {
        message: "Driver fetched successfully",
        data: driver,
      })
    } catch (err: any) {
      return sendError(res, {
        message: err.message || "Internal server error",
      })
    }
  }