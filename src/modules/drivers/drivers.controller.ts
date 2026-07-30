import { Request, Response } from "express"

import { getPagination } from "../../utils/pagination"
import { driverService } from "./drivers.service"
import { sendResponse } from "../../utils/apiResponse"
import { sendError } from "../../utils/apiError"
import { driverResource } from "./drivers.resource"

/* -----------------------------
   WHITELISTS
   These must stay in sync with the frontend's string unions.
   Anything outside the list is treated as "no filter" instead
   of being passed through to Prisma unvalidated — a typo or a
   stale frontend build can no longer silently return the wrong
   (or an empty) result set.
------------------------------ */
const VALID_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "BLOCKED"] as const
const VALID_RISK_LEVELS = ["low", "medium", "high"] as const
const VALID_VEHICLE_FILTERS = ["single", "multiple"] as const

type DriverStatus = (typeof VALID_STATUSES)[number]
type RiskLevel = (typeof VALID_RISK_LEVELS)[number]
type VehicleFilter = (typeof VALID_VEHICLE_FILTERS)[number]

function pickValid<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined
}

// GET ALL DRIVERS
export const getDrivers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query)

    const search = ((req.query.search as string) || "").trim()

    const status = pickValid<DriverStatus>(req.query.status, VALID_STATUSES)
    const riskLevel = pickValid<RiskLevel>(req.query.riskLevel, VALID_RISK_LEVELS)
    const vehicleFilter = pickValid<VehicleFilter>(
      req.query.vehicleFilter,
      VALID_VEHICLE_FILTERS
    )

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
    // Log the real error for ourselves, but don't assume it's safe
    // to forward err.message verbatim — a Prisma/DB error can leak
    // schema or connection details to the client.
    console.error("[getDrivers]", err)

    return sendError(res, {
      message: err.expose ? err.message : "Failed to fetch drivers",
      statusCode: err.statusCode || 500,
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
      // Previously returned the raw Prisma object here, so the detail
      // endpoint's shape depended on whatever findById's `select`
      // happened to return, with none of driverResource's
      // normalization applied. Now both endpoints share one shape.
      data: driverResource(driver),
    })
  } catch (err: any) {
    console.error("[getDriverById]", err)

    return sendError(res, {
      message: err.expose ? err.message : "Internal server error",
      statusCode: err.statusCode || 500,
    })
  }
}