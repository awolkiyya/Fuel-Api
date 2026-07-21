import { z } from "zod";

export const createTransactionSchema = z.object({
  fuelRequestId: z.string().uuid(),
  litersGiven: z.number().positive().max(200),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});