import { Router } from "express";
import {
  createCamera,
  getCameras,
  getCameraById,
  updateCamera,
  deleteCamera,

  toggleCameraStatus,
  toggleCameraAI,

  testCameraStream,
  updateCameraNetwork,
  updateCameraStreamConfig,
  getAiEnabledCamerasByStation,
  getStationAiCameras,
  updateQueueZone,
} from "./cameras.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createCameraSchema, updateCameraSchema } from "../../schemas/camera.schema";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

/* =========================================================
   CORE CRUD
========================================================= */

// GET all cameras (pagination + filters)
router.get("/",authMiddleware, getCameras);

// GET single camera
router.get("/:id",authMiddleware, getCameraById);

router.post(
   "/",
   authMiddleware,
   validate(createCameraSchema),
   createCamera
 )
 
 router.post(
   "/:id",
   authMiddleware,
   validate(updateCameraSchema),
   updateCamera
 )

// DELETE camera (soft delete recommended)
router.delete("/:id",authMiddleware, deleteCamera);

/* =========================================================
   STATION AI CAMERAS
========================================================= */
router.get(
   "/:stationId/ai",
   authMiddleware,
   getStationAiCameras
 );


/* =========================================================
   STATION AI SETTINGS (QUEUE ZONE)
========================================================= */
router.patch(
   "/:stationId/queue-zone",
   authMiddleware,
   updateQueueZone
 );











/* =========================================================
   STATUS CONTROL
========================================================= */

// Toggle ON / OFF (isActive or status control)
router.patch("/:id/status", toggleCameraStatus);

// Toggle AI processing ON / OFF
router.patch("/:id/ai", toggleCameraAI);

/* =========================================================
   STREAM / DIAGNOSTICS
========================================================= */

// Test camera stream (RTSP/WebRTC validation)
router.post("/:id/test", testCameraStream);

/* =========================================================
   NETWORK CONFIG (advanced ops)
========================================================= */

// Update IP / Port
router.patch("/:id/network", updateCameraNetwork);

/* =========================================================
   STREAM CONFIG (AI tuning)
========================================================= */

// FPS / codec / resolution tuning
router.patch("/:id/stream-config", updateCameraStreamConfig);

/* =========================================================
   AI ENABLED CAMERAS (BY STATION)
========================================================= */

// GET cameras that are AI-enabled (optionally by station)
router.get("/ai/enabled", getAiEnabledCamerasByStation);

export default router;