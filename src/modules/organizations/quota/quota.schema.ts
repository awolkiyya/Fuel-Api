import { z } from "zod";

// =====================================================
// ENUMS
// =====================================================

export const quotaPeriodTypeSchema = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "CUSTOM",
]);

export const quotaStatusSchema = z.enum([
  "ACTIVE",
  "EXHAUSTED",
  "EXPIRED",
  "CANCELLED",
]);

// =====================================================
// COMMON VALIDATORS
// =====================================================

const uuidSchema = z
  .string()
  .uuid("Invalid ID");

const positiveLitersSchema = z
  .number({
    message: "Allocated liters is required",
  })
  .finite("Allocated liters must be a valid number")
  .positive(
    "Allocated liters must be greater than zero",
  )
  .max(
    1_000_000_000,
    "Allocated liters is too large",
  );

// =====================================================
// CREATE QUOTA
// =====================================================

export const createQuotaSchema = z
  .object({
    // -------------------------------------------------
    // ORGANIZATION
    // -------------------------------------------------

    organizationId: uuidSchema,

    // -------------------------------------------------
    // FUEL TYPE
    // -------------------------------------------------

    fuelTypeId: uuidSchema,

    // -------------------------------------------------
    // PERIOD
    // -------------------------------------------------

    periodType: quotaPeriodTypeSchema,

    startDate: z.coerce.date({
      message: "Start date is required",
    }),

    endDate: z.coerce.date({
      message: "End date is required",
    }),

    // -------------------------------------------------
    // ALLOCATION
    // -------------------------------------------------

    allocatedLiters: positiveLitersSchema,

    // -------------------------------------------------
    // ASSIGNMENT
    // -------------------------------------------------

    assignedByUserId: uuidSchema
      .optional()
      .nullable(),

    referenceNumber: z
      .string()
      .trim()
      .min(
        1,
        "Reference number cannot be empty",
      )
      .max(
        100,
        "Reference number must not exceed 100 characters",
      )
      .optional()
      .nullable(),

    remarks: z
      .string()
      .trim()
      .max(
        1000,
        "Remarks must not exceed 1000 characters",
      )
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // -------------------------------------------------
    // DATE ORDER
    // -------------------------------------------------

    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message:
          "End date must be later than start date.",
      });
    }

    // -------------------------------------------------
    // DATE VALIDITY
    // -------------------------------------------------

    if (
      Number.isNaN(data.startDate.getTime())
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Invalid start date.",
      });
    }

    if (
      Number.isNaN(data.endDate.getTime())
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Invalid end date.",
      });
    }
  });

// =====================================================
// UPDATE QUOTA
// =====================================================

export const updateQuotaSchema = z
  .object({
    fuelTypeId: uuidSchema.optional(),

    periodType:
      quotaPeriodTypeSchema.optional(),

    startDate: z.coerce
      .date()
      .optional(),

    endDate: z.coerce
      .date()
      .optional(),

    allocatedLiters:
      positiveLitersSchema.optional(),

    referenceNumber: z
      .string()
      .trim()
      .min(
        1,
        "Reference number cannot be empty",
      )
      .max(
        100,
        "Reference number must not exceed 100 characters",
      )
      .optional()
      .nullable(),

    remarks: z
      .string()
      .trim()
      .max(
        1000,
        "Remarks must not exceed 1000 characters",
      )
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    // -------------------------------------------------
    // START / END DATE
    // -------------------------------------------------

    if (
      data.startDate &&
      data.endDate &&
      data.endDate <= data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message:
          "End date must be later than start date.",
      });
    }

    // -------------------------------------------------
    // AT LEAST ONE FIELD
    // -------------------------------------------------

    if (
      data.fuelTypeId === undefined &&
      data.periodType === undefined &&
      data.startDate === undefined &&
      data.endDate === undefined &&
      data.allocatedLiters === undefined &&
      data.referenceNumber === undefined &&
      data.remarks === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "At least one field is required for update.",
      });
    }
  });

// =====================================================
// APPROVE QUOTA
// =====================================================

export const approveQuotaSchema = z.object({
  approvedByUserId: uuidSchema,

  remarks: z
    .string()
    .trim()
    .max(
      1000,
      "Remarks must not exceed 1000 characters",
    )
    .optional()
    .nullable(),
});

// =====================================================
// CANCEL QUOTA
// =====================================================

export const cancelQuotaSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(
      3,
      "Cancellation reason must be provided",
    )
    .max(
      1000,
      "Cancellation reason is too long",
    ),
});

// =====================================================
// ACTIVE QUOTA QUERY
// =====================================================

export const getActiveQuotaSchema = z.object({
  organizationId: uuidSchema,

  fuelTypeId: uuidSchema,

  date: z.coerce
    .date()
    .optional(),
});

// =====================================================
// LIST QUOTAS
// =====================================================

export const getQuotasSchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(
      100,
      "Limit cannot exceed 100",
    )
    .default(10),

  organizationId:
    uuidSchema.optional(),

  fuelTypeId:
    uuidSchema.optional(),

  periodType:
    quotaPeriodTypeSchema.optional(),

  status:
    quotaStatusSchema.optional(),

  startDate: z.coerce
    .date()
    .optional(),

  endDate: z.coerce
    .date()
    .optional(),
});

// =====================================================
// QUOTA ID
// =====================================================

export const quotaIdSchema = z.object({
  id: uuidSchema,
});

// =====================================================
// TYPES
// =====================================================

export type CreateQuotaInput =
  z.infer<typeof createQuotaSchema>;

export type UpdateQuotaInput =
  z.infer<typeof updateQuotaSchema>;

export type ApproveQuotaInput =
  z.infer<typeof approveQuotaSchema>;

export type CancelQuotaInput =
  z.infer<typeof cancelQuotaSchema>;

export type GetActiveQuotaQuery =
  z.infer<typeof getActiveQuotaSchema>;

export type GetQuotasQuery =
  z.infer<typeof getQuotasSchema>;