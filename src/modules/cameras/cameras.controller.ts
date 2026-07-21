import { Request, Response } from "express";
import prisma from "../../config/db";
import ffmpeg from "fluent-ffmpeg"
import ffprobePath from "ffprobe-static"

ffmpeg.setFfprobePath(ffprobePath.path)

/* =========================================================
   HELPERS
========================================================= */

const handleError = (res: Response, error: any, message: string) => {
  console.error("Camera Controller Error:", error);
  return res.status(500).json({
    success: false,
    message,
  });
};

/* =========================================================
   GET ALL CAMERAS
========================================================= */
export const getCameras = async (_: Request, res: Response) => {
  try {
    const cameras = await prisma.camera.findMany({
      include: {
        station: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: cameras,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch cameras");
  }
};

/* =========================================================
   GET CAMERA BY ID
========================================================= */
export const getCameraById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    const camera = await prisma.camera.findUnique({
      where: { id },
      include: {
        station: true,
      },
    });

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }

    return res.json({
      success: true,
      data: camera,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch camera");
  }
};

export const createCamera = async (req: Request, res: Response) => {
  try {
    const {
      name,
      stationId,
      streamUrl,
      location,
      ipAddress,
      port,
      fps,
      codec,
      resolution,
      aiEnabled,
    } = req.body

    const camera = await prisma.camera.create({
      data: {
        name,
        streamUrl,

        type: "rtsp",

        station: {
          connect: { id: stationId },
        },

        location,
        ipAddress,
        port,
        fps,
        codec,
        resolution,

        aiEnabled: aiEnabled ?? false,
      },
    })

    return res.status(201).json({
      success: true,
      message: "Camera created successfully",
      data: camera,
    })
  } catch (error) {
    return handleError(res, error, "Failed to create camera")
  }
}

export const updateCamera = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id

    const camera = await prisma.camera.findUnique({
      where: { id },
    })

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      })
    }

    const {
      name,
      streamUrl,
      location,
      ipAddress,
      port,
      fps,
      codec,
      resolution,
      aiEnabled,
    } = req.body

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(streamUrl && { streamUrl }),
        ...(location && { location }),
        ...(ipAddress && { ipAddress }),
        ...(port && { port }),
        ...(fps && { fps }),
        ...(codec && { codec }),
        ...(resolution && { resolution }),
        ...(typeof aiEnabled === "boolean" && { aiEnabled }),
      },
    })

    return res.json({
      success: true,
      message: "Camera updated successfully",
      data: updated,
    })
  } catch (error) {
    return handleError(res, error, "Failed to update camera")
  }
}

/* =========================================================
   DELETE CAMERA (soft delete recommended in future)
========================================================= */
export const deleteCamera = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    await prisma.camera.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Camera deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete camera");
  }
};

/* =========================================================
   TOGGLE STATUS (ONLINE / OFFLINE CONTROL)
========================================================= */
export const toggleCameraStatus = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;    const { isActive } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        isActive,
      },
    });

    return res.json({
      success: true,
      message: "Camera status updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to toggle camera status");
  }
};

/* =========================================================
   TOGGLE AI
========================================================= */
export const toggleCameraAI = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id; 
    
    const { aiEnabled } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        aiEnabled,
      },
    });

    return res.json({
      success: true,
      message: "AI setting updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to toggle AI");
  }
};


/* =========================================================
   REAL CAMERA STREAM TEST (PRODUCTION + RELIABLE + SAFE)
========================================================= */

import dns from "dns";
import { CameraStatus, Prisma } from "@prisma/client";
dns.setDefaultResultOrder("ipv4first");

export const testCameraStream = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const camera = await prisma.camera.findUnique({
      where: { id },
    });

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }

    if (!camera.streamUrl) {
      return res.status(400).json({
        success: false,
        message: "Camera stream URL is missing",
      });
    }

    const url = camera.streamUrl;
    const start = Date.now();

    let isOnline = false;
    let errorMessage: string | null = null;
    let errorCode: string | null = null;
    let method = "unknown";

    const isHttpStream =
      url.startsWith("http://") || url.startsWith("https://");

    const isMjpeg =
      url.includes("mjpeg") ||
      url.includes("multipart") ||
      url.includes("/video");

    /* =========================================================
       HTTP / MJPEG CHECK (SAFE HEAD + STREAM VALIDATION)
    ========================================================= */

    if (isHttpStream && isMjpeg) {
      method = "http-mjpeg";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP_${response.status}`);
        }

        // ⚠️ IMPORTANT: do NOT fully consume stream (causes false failures)
        const reader = response.body.getReader();

        const { done, value } = await Promise.race([
          reader.read(),
          new Promise<{ done: true; value: undefined }>((_, reject) =>
            setTimeout(() => reject(new Error("STREAM_TIMEOUT")), 4000)
          ),
        ]);

        isOnline = !done && !!value && value.length > 0;

        if (!isOnline) {
          errorCode = "EMPTY_STREAM";
          errorMessage = "Connected but no frame received";
        }

        reader.releaseLock();
      } catch (err: any) {
        isOnline = false;

        const code =
          err?.code ||
          err?.cause?.code ||
          err?.errno ||
          err?.message;

        errorCode =
          code === "ECONNREFUSED"
            ? "CONNECTION_REFUSED"
            : code === "EHOSTUNREACH"
            ? "HOST_UNREACHABLE"
            : code === "ENETUNREACH"
            ? "NETWORK_UNREACHABLE"
            : code === "ENOTFOUND"
            ? "DNS_NOT_FOUND"
            : err?.name === "AbortError"
            ? "ABORTED_TIMEOUT"
            : "HTTP_FAILED";

        errorMessage = err?.message || "MJPEG stream error";

        console.error("[CAMERA MJPEG TEST ERROR]", {
          url,
          errorCode,
          errorMessage,
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    /* =========================================================
       RTSP / VIDEO CHECK (FFPROBE SAFE)
    ========================================================= */

    else {
      method = "ffprobe";

      isOnline = await new Promise<boolean>((resolve) => {
        let finished = false;

        const timeout = setTimeout(() => {
          if (!finished) {
            finished = true;
            errorCode = "TIMEOUT";
            errorMessage = "ffprobe timeout (8s)";
            resolve(false);
          }
        }, 8000);

        ffmpeg.ffprobe(url, (err) => {
          if (finished) return;

          clearTimeout(timeout);
          finished = true;

          if (err) {
            errorCode =
              err.message?.includes("ENOENT")
                ? "NOT_FOUND"
                : err.message?.includes("ECONNREFUSED")
                ? "CONNECTION_REFUSED"
                : err.message?.includes("ETIMEDOUT")
                ? "TIMEOUT"
                : "PROBE_FAILED";

            errorMessage = err.message;
            return resolve(false);
          }

          return resolve(true);
        });
      });
    }

    /* =========================================================
       METRICS
    ========================================================= */

    const latencyMs = Date.now() - start;

    await prisma.camera.update({
      where: { id },
      data: {
        status: isOnline ? "online" : "offline",
        lastCheckedAt: new Date(),
        ...(isOnline && {
          lastSeenAt: new Date(),
        }),
      },
    });

    /* =========================================================
       RESPONSE
    ========================================================= */

    return res.status(200).json({
      success: true,
      message: isOnline
        ? "Camera stream is online"
        : "Camera stream is offline",

      data: {
        id: camera.id,
        cameraName: camera.name,
        status: isOnline ? "online" : "offline",
        latencyMs,

        method,
        error: isOnline ? null : errorMessage,
        errorCode: isOnline ? null : errorCode,

        testedAt: new Date(),
      },
    });
  } catch (error) {
    return handleError(res, error, "Failed to test camera stream");
  }
};



/* =========================================================
   UPDATE NETWORK CONFIG
========================================================= */
export const updateCameraNetwork = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
        
    const { ipAddress, port } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        ipAddress,
        port,
      },
    });

    return res.json({
      success: true,
      message: "Network settings updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update network config");
  }
};

/* =========================================================
   UPDATE STREAM CONFIG (AI TUNING)
========================================================= */
export const updateCameraStreamConfig = async (
  req: Request,
  res: Response
) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;    const { fps, codec, resolution } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        fps,
        codec,
        resolution,
      },
    });

    return res.json({
      success: true,
      message: "Stream config updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update stream config");
  }
};


/* =========================================================
   GET AI ENABLED CAMERAS (OPTIONAL STATION FILTER)
========================================================= */

export const getAiEnabledCamerasByStation = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.query;

    const cameras = await prisma.camera.findMany({
      where: {
        aiEnabled: true,
        ...(stationId ? { stationId: String(stationId) } : {}),
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "AI-enabled cameras fetched successfully",
      data: cameras,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch AI cameras");
  }
};

export const getStationAiCameras = async (
  req: Request,
  res: Response
) => {
  try {
    const rawStationId = req.params.stationId;

    const stationId =
      typeof rawStationId === "string"
        ? rawStationId
        : rawStationId?.[0];

    if (!stationId) {
      return res.status(400).json({
        success: false,
        message: "stationId is required",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? (req.query.status as CameraStatus)
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.CameraWhereInput = {
      stationId,
      aiEnabled: true,

      ...(status && { status }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    const [stationSetting, cameras, total] =
      await Promise.all([
        prisma.stationSetting.findUnique({
          where: {
            stationId,
          },
          select: {
            queueZone: true,
          },
        }),

        prisma.camera.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            stationId: true,
            name: true,
            streamUrl: true,
            type: true,
            status: true,
            aiEnabled: true,
            isActive: true,

            location: true,
            latitude: true,
            longitude: true,

            ipAddress: true,
            port: true,

            resolution: true,
            fps: true,
            codec: true,

            lastCheckedAt: true,
            lastSeenAt: true,

            createdAt: true,
            updatedAt: true,
          },
        }),

        prisma.camera.count({
          where,
        }),
      ]);

    return res.status(200).json({
      success: true,
      message: "Station AI cameras loaded successfully",

      data: {
        queueZone: stationSetting?.queueZone ?? null,
        cameras,
      },

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to load station AI cameras"
    );
  }
};

export const updateQueueZone = async (req: Request, res: Response) => {
  try {
    console.log("📥 [QUEUE ZONE REQUEST RECEIVED]");
    console.log("params.stationId:", req.params.stationId);
    console.log("body:", JSON.stringify(req.body, null, 2));

    const rawStationId = req.params.stationId;

    const stationId =
      typeof rawStationId === "string" ? rawStationId : rawStationId?.[0];

    console.log("🧾 parsed stationId:", stationId);

    if (!stationId) {
      console.log("❌ Missing stationId");
      return res.status(400).json({
        success: false,
        message: "stationId is required",
      });
    }

    const queueZone = req.body?.queueZone;

    console.log("📦 queueZone raw:", queueZone);

    // STRICT validation
    if (
      !queueZone ||
      typeof queueZone.x !== "number" ||
      typeof queueZone.y !== "number" ||
      typeof queueZone.width !== "number" ||
      typeof queueZone.height !== "number"
    ) {
      console.log("❌ Invalid queueZone payload detected");
      console.log("queueZone type:", typeof queueZone);
      console.log("queueZone value:", queueZone);

      return res.status(400).json({
        success: false,
        message: "Invalid queueZone payload",
      });
    }

    const cleanQueueZone = {
      x: Number(queueZone.x),
      y: Number(queueZone.y),
      width: Number(queueZone.width),
      height: Number(queueZone.height),
    };

    console.log("🚀 BEFORE UPSERT");
    console.log("stationId:", stationId);
    console.log("queueZone:", cleanQueueZone);

    const existing = await prisma.stationSetting.findUnique({
      where: { stationId },
    });

    console.log("🔍 existing setting:", existing);

    const updated = await prisma.stationSetting.upsert({
      where: { stationId },
      create: {
        stationId,
        queueZone: cleanQueueZone,
        thresholdLow: 10,
        thresholdMedium: 20,
        thresholdHigh: 30,
        thresholdCritical: 40,
        maxQueueCapacity: 50,
        minFuelRequestLiters: 1,
      },
      update: {
        queueZone: cleanQueueZone,
      },
    });

    console.log("✅ DB update success:", updated);

    return res.status(200).json({
      success: true,
      message: "Queue zone updated successfully",
      data: updated.queueZone,
    });
  } catch (error: any) {
    console.error("🔥 QUEUE ZONE ERROR CAUGHT");
    console.error("name:", error?.name);
    console.error("message:", error?.message);
    console.error("stack:", error?.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to update queue zone",
      error: {
        name: error?.name,
        message: error?.message,
      },
    });
  }
};