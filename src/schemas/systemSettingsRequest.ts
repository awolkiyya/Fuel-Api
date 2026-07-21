import { z } from "zod"

/* ---------------------------------------
   SYSTEM SETTINGS VALIDATION SCHEMA
----------------------------------------*/
export const updateSystemSettingsSchema = z.object({
  maxTrafficLow: z.number().int().min(0).optional(),
  maxTrafficMedium: z.number().int().min(0).optional(),
  maxTrafficHigh: z.number().int().min(0).optional(),
  maxTrafficCritical: z.number().int().min(0).optional(),

  aiEnabled: z.boolean().optional(),
  aiMinConfidence: z.number().min(0).max(1).optional(),
  aiRefreshSeconds: z.number().int().min(1).optional(),

  autoRiskDetection: z.boolean().optional(),
  maxQueueCapacityGlobal: z.number().int().min(1).optional(),
  maxRequestDistanceKm: z.number().int().min(1).optional(),

  maxActiveCamerasPerStation: z.number().int().min(0).optional(),

  systemActive: z.boolean().optional(),
})