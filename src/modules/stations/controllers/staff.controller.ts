import { Request, Response } from "express"
import prisma from "../../../config/db"
import bcrypt from "bcrypt"

// -----------------------------
// SAFE PARAM HELPER
// -----------------------------
const toString = (v: string | string[] | undefined): string => {
  if (!v) return ""
  return Array.isArray(v) ? v[0] : v
}

// ================= CREATE STAFF =================
export const createStationStaff = async (req: Request, res: Response) => {
  try {
    // -----------------------------
    // SECURE STATION CONTEXT (NOT FROM PARAMS)
    // -----------------------------
    const stationId = (req as any).user?.stationId

    const {
      full_name,
      phone,
      email,
      gender,
      password,
    } = req.body

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (!stationId || !full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "full_name, email, password, station context are required",
      })
    }

    // -----------------------------
    // DUPLICATE CHECK
    // -----------------------------
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone ? { phone } : undefined,
        ].filter(Boolean) as any,
      },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or phone already exists",
      })
    }

    // -----------------------------
    // HASH PASSWORD
    // -----------------------------
    const hashedPassword = await bcrypt.hash(password, 10)

    // -----------------------------
    // CREATE STAFF (BOUND TO STATION)
    // -----------------------------
    const user = await prisma.user.create({
      data: {
        full_name,
        phone: phone ?? null,
        email,
        gender: gender ?? "MALE",
        role: "station_staff",
        password: hashedPassword,

        // IMPORTANT: ALWAYS FROM AUTH CONTEXT
        stationId,

        status: "ACTIVE",
      },
    })

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: user,
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to create staff",
      error: {
        name: error?.name,
        code: error?.code,
        message: error?.message,
        meta: error?.meta,
      },
    })
  }
}

// ================= GET ALL STAFF =================
export const getStationStaff = async (req: Request, res: Response) => {
  try {
    const stationId = toString(req.params.id)

    if (!stationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid stationId",
      })
    }

    const staff = await prisma.user.findMany({
      where: {
        stationId,
        role: "station_staff",
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return res.status(200).json({
      success: true,
      data: staff,
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error?.message,
    })
  }
}

// ================= GET SINGLE STAFF =================
export const getStationStaffById = async (req: Request, res: Response) => {
  try {
    const stationId = toString(req.params.id)
    const userId = toString(req.params.userId)

    if (!stationId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid stationId or userId",
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        stationId,
        role: "station_staff",
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: user,
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error?.message,
    })
  }
}

// ================= UPDATE STAFF STATUS =================
export const updateStaffStatus = async (req: Request, res: Response) => {
  try {
    const stationId = toString(req.params.id)
    const userId = toString(req.params.userId)
    const { status } = req.body

    if (!stationId || !userId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // IMPORTANT: enforce station ownership
    const user = await prisma.user.updateMany({
      where: {
        id: userId,
        stationId,
        role: "station_staff",
      },
      data: {
        status,
      },
    })

    return res.status(200).json({
      success: true,
      message: "Staff status updated",
      data: user,
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update staff status",
      error: error?.message,
    })
  }
}

// ================= UPDATE STAFF PASSWORD =================
export const updateStaffPassword = async (req: Request, res: Response) => {
  try {
    const stationId = toString(req.params.id)
    const userId = toString(req.params.userId)
    const { newPassword } = req.body

    if (!stationId || !userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid request (password must be 6+ characters)",
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const user = await prisma.user.updateMany({
      where: {
        id: userId,
        stationId,
        role: "station_staff",
      },
      data: {
        password: hashedPassword,
      },
    })

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: user,
    })

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error?.message,
    })
  }
}