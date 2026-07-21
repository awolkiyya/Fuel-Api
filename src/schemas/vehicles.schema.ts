import { z } from "zod";


export const createVehicleSchema = z.object({
  // ================= RELATIONS =================
  vehicleTypeId: z.string({
    error: "Vehicle type is required",
  }).uuid({
    error: "Invalid vehicle type ID",
  }),

  fuelTypeId: z.string({
    error: "Fuel type is required",
  }).uuid({
    error: "Invalid fuel type ID",
  }),

  // ================= REGION CODE (NEW) =================
  regionCode: z
    .string({
      error: "Region code is required",
    })
    .min(1, {
      error: "Region code is required",
    })
    .max(5, {
      error: "Region code is too long",
    })
    .transform((val) => val.trim().toUpperCase()),

  // ================= IDENTITY =================
  vin: z.string({
    error: "VIN is required",
  })
  .min(5, {
    error: "VIN must be at least 5 characters",
  })
  .max(50, {
    error: "VIN is too long",
  })
  .transform((val) => val.trim().toUpperCase()),

  plateNumber: z.string({
    error: "Plate number is required",
  })
  .min(3, {
    error: "Plate number is too short",
  })
  .max(15, {
    error: "Plate number is too long",
  })
  .regex(/^[A-Z0-9-]+$/, {
    error: "Invalid plate format",
  })
  .transform((val) => val.trim().toUpperCase()),

  // ================= TECHNICAL =================
  fuelCapacity: z.number({
    error: "Fuel capacity is required",
  })
  .positive({
    error: "Fuel capacity must be greater than 0",
  })
  .max(500, {
    error: "Fuel capacity cannot exceed 500L",
  }),

  // ================= OPTIONAL =================
  isVerified: z.boolean().optional().default(false),
});

export type CreateVehicleDTO = z.infer<typeof createVehicleSchema>;



export const updateVehicleSchema = z.object({
  // ================= OPTIONAL UPDATABLE FIELDS =================
  vehicleTypeId: z
    .string({ error: "Vehicle type is required" })
    .uuid({ error: "Invalid vehicle type ID" })
    .optional(),

  fuelTypeId: z
    .string({ error: "Fuel type is required" })
    .uuid({ error: "Invalid fuel type ID" })
    .optional(),

  // ================= REGION CODE (NEW) =================
  regionCode: z
    .string({ error: "Region code is required" })
    .min(1)
    .max(5)
    .transform((val) => val.trim().toUpperCase())
    .optional(),

  // ================= IDENTITY =================
  vin: z
    .string({ error: "VIN is required" })
    .min(5, { error: "VIN must be at least 5 characters" })
    .max(50, { error: "VIN is too long" })
    .transform((val) => val.trim().toUpperCase())
    .optional(),

  plateNumber: z
    .string({ error: "Plate number is required" })
    .min(3, { error: "Plate number is too short" })
    .max(15, { error: "Plate number is too long" })
    .regex(/^[A-Z0-9-]+$/, { error: "Invalid plate format" })
    .transform((val) => val.trim().toUpperCase())
    .optional(),

  fuelCapacity: z
    .number({ error: "Fuel capacity is required" })
    .positive({ error: "Fuel capacity must be greater than 0" })
    .max(500, { error: "Fuel capacity cannot exceed 500L" })
    .optional(),

  isVerified: z.boolean().optional(),
});

export type UpdateVehicleDTO = z.infer<typeof updateVehicleSchema>;