import { z } from "zod";

export const FuelStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const createFuelTypeSchema = z.object({
  name: z
    .string({ error: "Fuel name is required" })
    .min(2, { error: "Too short" })
    .max(20, { error: "Too long" })
    .transform((v) => v.trim().toUpperCase()),

  price: z
    .coerce.number({ error: "Price must be a number" })
    .positive({ error: "Must be > 0" }),
});

export const updateFuelTypeSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(20)
    .transform((v) => v.trim().toUpperCase())
    .optional(),

  price: z
    .coerce.number()
    .positive()
    .optional(),

  status: FuelStatusEnum.optional(),
});
// ✅ inferred types
export type CreateFuelTypeDTO = z.infer<typeof createFuelTypeSchema>
export type UpdateFuelTypeDTO = z.infer<typeof updateFuelTypeSchema>


export const paramsSchema = z.object({
  id: z.string().uuid("Invalid fuel type id"),
});

export const updateFuelStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});