import { z } from "zod";

// =====================================================
// ENUMS
// =====================================================

export const orgTypeSchema = z.enum([
  "GOVERNMENT",
  "PUBLIC_INSTITUTION",
  "PRIVATE_COMPANY",
  "NGO",
  "OTHER",
]);

export const orgStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "BLOCKED",
]);


// =====================================================
// CREATE ORGANIZATION
// =====================================================

export const createOrganizationSchema = z.object({
  // ---------------------------------------------------
  // BASIC IDENTITY
  // ---------------------------------------------------

  name: z
    .string({
      message: "Organization name is required",
    })
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(255, "Organization name must not exceed 255 characters"),

  type: orgTypeSchema,

  registrationNumber: z
    .string()
    .trim()
    .max(100, "Registration number must not exceed 100 characters")
    .optional()
    .nullable(),


  // ---------------------------------------------------
  // CONTACT INFORMATION
  // ---------------------------------------------------

  contactPerson: z
    .string()
    .trim()
    .max(255, "Contact person must not exceed 255 characters")
    .optional()
    .nullable(),

  phone: z
    .string()
    .trim()
    .max(50, "Phone number must not exceed 50 characters")
    .optional()
    .nullable(),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters")
    .optional()
    .nullable(),

  address: z
    .string()
    .trim()
    .max(500, "Address must not exceed 500 characters")
    .optional()
    .nullable(),


  // ---------------------------------------------------
  // STATUS
  // ---------------------------------------------------

  status: orgStatusSchema.optional(),


  // ---------------------------------------------------
  // FUEL ACCESS POLICY
  // ---------------------------------------------------

  allowFuelAccess: z
    .boolean()
    .optional(),

  requiresQuota: z
    .boolean()
    .optional(),

  maxTransactionLiters: z
    .number()
    .positive("Maximum transaction liters must be greater than 0")
    .max(
      1_000_000,
      "Maximum transaction liters is too large",
    )
    .optional(),


  // ---------------------------------------------------
  // API / INTEGRATION
  // ---------------------------------------------------

  apiKey: z
    .string()
    .trim()
    .min(16, "API key must be at least 16 characters")
    .max(255, "API key is too long")
    .optional()
    .nullable(),
});


// =====================================================
// UPDATE ORGANIZATION
// =====================================================

export const updateOrganizationSchema =
  createOrganizationSchema.partial();


// =====================================================
// UPDATE STATUS
// =====================================================

export const updateOrganizationStatusSchema = z.object({
  status: orgStatusSchema,
});


// =====================================================
// UPDATE FUEL ACCESS
// =====================================================

export const updateOrganizationFuelAccessSchema = z.object({
  allowFuelAccess: z.boolean(),
});


// =====================================================
// UPDATE FUEL POLICY
// =====================================================

export const updateOrganizationFuelPolicySchema = z.object({
  requiresQuota: z.boolean().optional(),

  maxTransactionLiters: z
    .number()
    .positive("Maximum transaction liters must be greater than 0")
    .max(
      1_000_000,
      "Maximum transaction liters is too large",
    )
    .optional(),
});


// =====================================================
// LIST / FILTER ORGANIZATIONS
// =====================================================

export const getOrganizationsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  search: z
    .string()
    .trim()
    .optional(),

  status: orgStatusSchema.optional(),

  type: orgTypeSchema.optional(),

  allowFuelAccess: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  requiresQuota: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});


// =====================================================
// PARAMS
// =====================================================

export const organizationIdSchema = z.object({
  id: z
    .string()
    .uuid("Invalid organization ID"),
});


// =====================================================
// TYPES
// =====================================================

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>;

export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationSchema
>;

export type UpdateOrganizationStatusInput = z.infer<
  typeof updateOrganizationStatusSchema
>;

export type UpdateOrganizationFuelAccessInput = z.infer<
  typeof updateOrganizationFuelAccessSchema
>;

export type UpdateOrganizationFuelPolicyInput = z.infer<
  typeof updateOrganizationFuelPolicySchema
>;

export type GetOrganizationsQuery = z.infer<
  typeof getOrganizationsSchema
>;