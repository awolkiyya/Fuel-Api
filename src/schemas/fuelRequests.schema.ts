import { z } from "zod";


export const createFuelRequestSchema = z.object({
  vehicleId: z.string().uuid(),
  stationId: z.string().uuid(),
  fuelTypeId: z.string().uuid(),

  // 🌍 Geo coordinates (IMPORTANT: numeric)
  lat: z.coerce
    .number({
      message: "Latitude is required",
    })
    .min(-90)
    .max(90),

  long: z.coerce
    .number({
      message: "Longitude is required",
    })
    .min(-180)
    .max(180),

  requestedLiters: z.coerce
    .number({
      message: "Requested liters is required",
    })
    .positive()
    .max(200),
});

// APPROVE
export const approveFuelRequestSchema = z.object({
  approvedLiters: z
    .number()
    .positive()
    .max(200),
});

// Reject
export const rejectFuelRequestSchema = z.object({
  rejectionReasonId: z.string().uuid(),

  rejectionNote: z
    .string()
    .max(500)
    .optional(),
});

// PARAM
export const idParamSchema = z.object({
  id: z.string().uuid(),
});