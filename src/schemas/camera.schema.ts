import { z } from "zod";



/* ================= ENUMS ================= */


export const cameraProtocolSchema = z.enum([
  "RTSP",
  "HTTP",
  "HTTPS",
  "WEBRTC",
]);


export const cameraAuthTypeSchema = z.enum([
  "NONE",
  "BASIC",
  "DIGEST",
  "TOKEN",
]);





/* ================= CREATE ================= */


export const createCameraSchema = z.object({


  // ================= BASIC =================

  name: z.string()
    .min(1, "Camera name is required"),


  stationId: z.string()
    .min(1, "Station is required"),




  // ================= CONNECTION =================

  protocol: cameraProtocolSchema,


  host: z.string()
    .min(1, "Camera host is required"),


  port: z.number()
    .int()
    .positive()
    .default(554),



  streamPath: z.string()
    .min(1, "Stream path is required"),




  // ================= AUTH =================

  authType: cameraAuthTypeSchema
    .default("NONE"),



  username: z.string()
    .optional(),



  password: z.string()
    .optional(),





  // ================= LOCATION =================

  location: z.string()
    .optional(),



  latitude: z.number()
    .optional(),



  longitude: z.number()
    .optional(),





  // ================= STREAM =================

  resolution: z.string()
    .optional(),



  fps: z.number()
    .int()
    .positive()
    .optional(),



  codec: z.string()
    .optional(),





  // ================= AI =================


  aiEnabled: z.boolean()
    .default(false),




  // ================= CONTROL =================


  isActive: z.boolean()
    .default(true),


});





/* ================= UPDATE ================= */


export const updateCameraSchema = z.object({


  name: z.string()
    .min(1)
    .optional(),



  // ================= CONNECTION =================


  protocol: cameraProtocolSchema
    .optional(),



  host: z.string()
    .min(1)
    .optional(),



  port: z.number()
    .int()
    .positive()
    .optional(),



  streamPath: z.string()
    .min(1)
    .optional(),





  // ================= AUTH =================


  authType: cameraAuthTypeSchema
    .optional(),



  username: z.string()
    .optional(),



  password: z.string()
    .optional(),





  // ================= LOCATION =================


  location: z.string()
    .optional(),



  latitude: z.number()
    .optional(),



  longitude: z.number()
    .optional(),





  // ================= STREAM =================


  resolution: z.string()
    .optional(),



  fps: z.number()
    .int()
    .positive()
    .optional(),



  codec: z.string()
    .optional(),





  // ================= AI =================


  aiEnabled: z.boolean()
    .optional(),





  // ================= CONTROL =================


  isActive: z.boolean()
    .optional(),


});