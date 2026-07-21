import { z } from "zod";

const baseBusinessLicenseSchema = z.object({
  licenseNumber: z.string().min(3).max(50),
  expiryDate: z.string().datetime(),

  requestType: z.enum([
    "NEW",
    "RENEWAL",
  ]),
});

export const createBusinessLicenseSchema =
  baseBusinessLicenseSchema.extend({
    issuedBy: z.string().optional(),
    issuedAt: z.string().datetime().optional(),
  });

export type CreateBusinessLicenseDTO = z.infer<
  typeof createBusinessLicenseSchema
>;

export const updateBusinessLicenseSchema =
  baseBusinessLicenseSchema.extend({
    issuedBy: z.string().optional(),
    issuedAt: z.string().datetime().optional(),
    status: z.enum([
      "PENDING",
      "APPROVED",
      "REJECTED",
      "EXPIRED",
    ]).optional(),
  });

export type UpdateBusinessLicenseDTO = z.infer<
  typeof updateBusinessLicenseSchema
>;