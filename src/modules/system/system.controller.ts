import { Request, Response } from "express"
import prisma from "../../config/db"

/* ---------------------------------------
   SYSTEM SETTINGS SINGLETON ID
----------------------------------------*/
const SYSTEM_SETTINGS_ID = "global"

/* ---------------------------------------
   DEFAULT SYSTEM CONFIG (RESET BASELINE)
   NOTE: no `id` here (important fix)
----------------------------------------*/
const DEFAULT_SYSTEM_SETTINGS = {
  maxTrafficLow: 20,
  maxTrafficMedium: 50,
  maxTrafficHigh: 80,
  maxTrafficCritical: 100,

  aiEnabled: true,
  aiMinConfidence: 0.6,
  aiRefreshSeconds: 5,

  autoRiskDetection: true,
  maxQueueCapacityGlobal: 100,
  maxRequestDistanceKm: 10,

  maxActiveCamerasPerStation: 3,

  systemActive: true,
}

/* ---------------------------------------
   GET SYSTEM SETTINGS
----------------------------------------*/
export const getSystemSettings = async (
  req: Request,
  res: Response
) => {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: SYSTEM_SETTINGS_ID },
    })

    // auto-create if missing (failsafe bootstrap)
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: SYSTEM_SETTINGS_ID,
          ...DEFAULT_SYSTEM_SETTINGS,
        },
      })
    }

    return res.json(settings)
  } catch (error) {
    console.error("GET_SYSTEM_SETTINGS_ERROR:", error)
    return res.status(500).json({
      message: "Failed to fetch system settings",
    })
  }
}

/* ---------------------------------------
   UPDATE SYSTEM SETTINGS (PATCH SAFE)
----------------------------------------*/
export const updateSystemSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const data = req.body

    const updated = await prisma.systemSettings.upsert({
      where: { id: SYSTEM_SETTINGS_ID },
      update: {
        ...data,
      },
      create: {
        id: SYSTEM_SETTINGS_ID,
        ...DEFAULT_SYSTEM_SETTINGS,
        ...data,
      },
    })

    return res.json({
      message: "System settings updated successfully",
      data: updated,
    })
  } catch (error) {
    console.error("UPDATE_SYSTEM_SETTINGS_ERROR:", error)
    return res.status(500).json({
      message: "Failed to update system settings",
    })
  }
}

/* ---------------------------------------
   RESET SYSTEM SETTINGS
----------------------------------------*/
export const resetSystemSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const reset = await prisma.systemSettings.upsert({
      where: { id: SYSTEM_SETTINGS_ID },
      update: {
        ...DEFAULT_SYSTEM_SETTINGS,
      },
      create: {
        id: SYSTEM_SETTINGS_ID,
        ...DEFAULT_SYSTEM_SETTINGS,
      },
    })

    return res.json({
      message: "System settings reset successfully",
      data: reset,
    })
  } catch (error) {
    console.error("RESET_SYSTEM_SETTINGS_ERROR:", error)
    return res.status(500).json({
      message: "Failed to reset system settings",
    })
  }
}