// src/modules/transactions/transactions.validation.ts

import { z } from "zod";

export const createOrganizationTransactionSchema = z.object({
  organizationId: z
    .string()
    .uuid(),

  fuelTypeId: z
    .string()
    .uuid(),

  stationId: z
    .string()
    .uuid(),

  litersGiven: z
    .number()
    .positive(),

  attendantId: z
    .string()
    .uuid()
    .optional(),

  nozzleId: z
    .string()
    .uuid()
    .optional(),
});

export type CreateOrganizationTransactionInput =
  z.infer<typeof createOrganizationTransactionSchema>;