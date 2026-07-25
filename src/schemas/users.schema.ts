import { z } from "zod"

/* =====================================================
   👤 ROLE ENUM
===================================================== */
export const userRoleEnum = z.enum([
  "admin",
  "station_manager",
  "station_staff",
])

/* =====================================================
   ⚧ GENDER ENUM
===================================================== */
export const genderEnum = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
])

/* =====================================================
   🧠 CREATE USER
===================================================== */
export const createUserSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),

  phone: z.string().min(10, "Phone number is required"),

  email: z.string().email().optional(),

  password: z.string().min(6, "Password must be at least 6 characters"),

  role: userRoleEnum.default("station_manager"),

  gender: genderEnum.default("MALE"),
})

/* =====================================================
   🧠 UPDATE USER
===================================================== */
export const updateUserSchema = z.object({
  full_name: z.string().min(2).optional(),

  phone: z.string().min(10).optional(),

  email: z.string().email().optional(),

  role: userRoleEnum.optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),

  gender: genderEnum.optional(),
})

/* =====================================================
   🔐 RESET USER PASSWORD
===================================================== */
export const resetUserPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
})

/* =====================================================
   🧠 ID PARAM VALIDATION
===================================================== */
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
})