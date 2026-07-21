import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name is required")
    .max(100)
    .trim(),

  phone: z
    .string()
    .min(7, "Phone number is required")
    .max(20)
    .trim(),

  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  age: z
    .number({ message: "Age must be a number" })
    .int()
    .min(18, "Must be at least 18"),

  gender: z.enum(["MALE", "FEMALE"]),

  national_id: z
    .string()
    .min(5, "Invalid national ID")
    .max(50)
    .trim(),

  license_number: z
    .string()
    .min(5, "Invalid license number")
    .max(50)
    .trim(),
});