import { z } from "zod"

export const createCameraSchema = z.object({
  name: z.string().min(1),
  stationId: z.string().min(1),
  streamUrl: z.string().min(1),

  location: z.string().optional(),
  ipAddress: z.string().optional(),
  port: z.number().int().optional(),

  fps: z.number().int().optional(),
  codec: z.string().optional(),
  resolution: z.string().optional(),

  aiEnabled: z.boolean().optional(),
})

export const updateCameraSchema = z.object({
    name: z.string().min(1).optional(),
    streamUrl: z.string().min(1).optional(),
  
    location: z.string().optional(),
    ipAddress: z.string().optional(),
    port: z.number().int().optional(),
  
    fps: z.number().int().optional(),
    codec: z.string().optional(),
    resolution: z.string().optional(),
  
    aiEnabled: z.boolean().optional(),
  
  })