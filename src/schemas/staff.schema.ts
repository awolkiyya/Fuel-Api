import { z } from "zod"

export const createStationStaffSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name is required")
    .max(100),

  phone: z.string().optional().nullable(),

  email: z
    .string()
    .email("Invalid email")
    .optional(),

  gender: z
    .enum(["MALE", "FEMALE"])
    .default("MALE"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100)
    .optional(), 
    // optional because you may auto-generate it

  role: z
    .literal("station_staff")
    .default("station_staff"),

})


export const updateStaffStatusSchema = z.object({
  status: z.enum(["ACTIVE", "OFF", "SUSPENDED"]),
})

export const updateStaffPasswordSchema = z.object({
  currentPassword: z.string().optional(),
  
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
})