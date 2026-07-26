import { Router } from "express";

import {
    getActiveStations,
    getStationConfig,
    getStationCamera,
    updateAIResult,
    heartbeat
} from "./ai.controller";
import { aiAuthMiddleware } from "../../middlewares/aiAuth.middleware";





const router = Router();



// =====================================
// AI ENGINE AUTHENTICATION
// =====================================

router.use(
    aiAuthMiddleware
);



// =====================================
// AI ENGINE CONFIG
// =====================================


// Get all active stations
router.get(
    "/stations/active",
    getActiveStations
);



// Get station full AI config
router.get(
    "/stations/:stationId/config",
    getStationConfig
);



// Get camera config
router.get(
    "/stations/:stationId/camera",
    getStationCamera
);



// Receive detection analytics
router.post(
    "/update",
    updateAIResult
);



// Worker heartbeat
router.post(
    "/heartbeat",
    heartbeat
);



export default router;