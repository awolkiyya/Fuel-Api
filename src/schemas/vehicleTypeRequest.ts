import { z } from "zod";

/* -----------------------------
   CREATE
------------------------------ */
export const VehicleTypeCreateSchema = z.object({
  code: z
    .number()
    .int("Code must be an integer")
    .positive("Code must be greater than 0"),

  name: z
    .string()
    .min(2, "Vehicle type name is too short")
    .max(50, "Vehicle type name is too long")
    .trim(),

  requiresBusinessLicense: z.boolean().default(false),

  requiresDriverLicense: z.boolean().default(true),

  fuelTypes: z
    .array(z.string().uuid("Invalid fuel type ID"))
    .min(1, "Select at least one fuel type"),

  maxLitersPerHour: z
    .number()
    .nonnegative("Must be 0 or greater"),

  minRefillIntervalMinutes: z
    .number()
    .int()
    .min(1, "Must be at least 1 minute")
    .optional(),

  maxRefillsPerDay: z
    .number()
    .int()
    .nonnegative()
    .optional(),

  maxDailyLiters: z
    .number()
    .nonnegative()
    .optional(),

  description: z.string().max(255).optional().nullable(),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .default("ACTIVE"),
});

/* -----------------------------
   UPDATE
------------------------------ */
export const VehicleTypeUpdateSchema = z.object({
  code: z.number().int().positive().optional(),

  name: z.string().min(2).max(50).trim().optional(),

  requiresBusinessLicense: z.boolean().optional(),

  requiresDriverLicense: z.boolean().optional(),

  fuelTypes: z.array(z.string().uuid()).optional(),

  maxLitersPerHour: z.number().nonnegative().optional(),

  minRefillIntervalMinutes: z.number().int().min(1).optional(),

  maxRefillsPerDay: z.number().int().nonnegative().optional(),

  maxDailyLiters: z.number().nonnegative().optional(),

  description: z.string().max(255).optional().nullable(),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});


export const vehicleParamsSchema = z.object({
  id: z.string().uuid("Invalid vehicle type id"),
});

export const updateVehicleTypeStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});