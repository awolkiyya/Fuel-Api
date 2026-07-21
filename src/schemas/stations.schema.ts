import { z } from "zod"

/* =========================
   BASE (RAW FORM DATA)
========================= */
const stationBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),

  // ⚠️ FormData ALWAYS sends string
  lat: z.string().min(1, "Latitude is required"),
  lng: z.string().min(1, "Longitude is required"),

  address: z.string().optional(),

  // File comes from multer (NOT zod in backend)
  image: z.any().optional(),
})



/* =========================
   CREATE
========================= */
export const createStationSchema = stationBaseSchema

/* =========================
   UPDATE
========================= */
export const updateStationSchema = stationBaseSchema.partial()

/* =========================
   SAFE TYPES (AFTER TRANSFORM)
========================= */
export type StationFormInput = z.input<typeof stationBaseSchema>

export type StationFormValues = z.output<typeof stationBaseSchema>