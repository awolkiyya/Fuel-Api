import { z } from "zod";

// =====================================================
// CREATE VEHICLE
// =====================================================

export const createVehicleSchema = z.object({

  // ================= RELATIONS =================

  vehicleTypeId: z
    .string({
      error: "Vehicle type is required",
    })
    .uuid({
      error: "Invalid vehicle type ID",
    }),

  fuelTypeId: z
    .string({
      error: "Fuel type is required",
    })
    .uuid({
      error: "Invalid fuel type ID",
    }),

  // ================= REGION =================

  regionCode: z
    .string({
      error: "Region code is required",
    })
    .trim()
    .min(1, {
      error: "Region code is required",
    })
    .max(5, {
      error: "Region code is too long",
    })
    .transform((val) => val.toUpperCase()),

  // ================= IDENTITY =================

  vin: z
    .string({
      error: "VIN is required",
    })
    .trim()
    .min(5, {
      error: "VIN must be at least 5 characters",
    })
    .max(50, {
      error: "VIN is too long",
    })
    .transform((val) => val.toUpperCase()),

  plateNumber: z
    .string({
      error: "Plate number is required",
    })
    .trim()
    .min(3, {
      error: "Plate number is too short",
    })
    .max(15, {
      error: "Plate number is too long",
    })
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => /^[A-Z0-9-]+$/.test(val),
      {
        error: "Invalid plate format",
      }
    ),

  // ================= TECHNICAL =================

  // IMPORTANT:
  // Multipart/form-data sends this as a string.
  // Example: "100.0" -> 100

  fuelCapacity: z
    .coerce
    .number({
      error: "Fuel capacity is required",
    })
    .positive({
      error: "Fuel capacity must be greater than 0",
    })
    .max(500, {
      error: "Fuel capacity cannot exceed 500L",
    }),
});

export type CreateVehicleDTO =
  z.infer<typeof createVehicleSchema>;


// =====================================================
// UPDATE VEHICLE
// =====================================================

export const updateVehicleSchema = z.object({

  // ================= RELATIONS =================

  vehicleTypeId: z
    .string({
      error: "Vehicle type is required",
    })
    .uuid({
      error: "Invalid vehicle type ID",
    })
    .optional(),

  fuelTypeId: z
    .string({
      error: "Fuel type is required",
    })
    .uuid({
      error: "Invalid fuel type ID",
    })
    .optional(),

  // ================= REGION =================

  regionCode: z
    .string({
      error: "Region code is required",
    })
    .trim()
    .min(1, {
      error: "Region code is required",
    })
    .max(5, {
      error: "Region code is too long",
    })
    .transform((val) => val.toUpperCase())
    .optional(),

  // ================= IDENTITY =================

  vin: z
    .string({
      error: "VIN is required",
    })
    .trim()
    .min(5, {
      error: "VIN must be at least 5 characters",
    })
    .max(50, {
      error: "VIN is too long",
    })
    .transform((val) => val.toUpperCase())
    .optional(),

  plateNumber: z
    .string({
      error: "Plate number is required",
    })
    .trim()
    .min(3, {
      error: "Plate number is too short",
    })
    .max(15, {
      error: "Plate number is too long",
    })
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => /^[A-Z0-9-]+$/.test(val),
      {
        error: "Invalid plate format",
      }
    )
    .optional(),

  // IMPORTANT:
  // Multipart/form-data sends "100.0" as a string.

  fuelCapacity: z
    .coerce
    .number({
      error: "Fuel capacity is required",
    })
    .positive({
      error: "Fuel capacity must be greater than 0",
    })
    .max(500, {
      error: "Fuel capacity cannot exceed 500L",
    })
    .optional(),
});

export type UpdateVehicleDTO =
  z.infer<typeof updateVehicleSchema>;