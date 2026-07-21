import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import prisma from "../config/db"

// -----------------------------
// Request type
// -----------------------------
export interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    stationId?: string
  }
}

// -----------------------------
// JWT payload type
// -----------------------------
interface TokenPayload extends JwtPayload {
  id: string
  role: string
  stationId?: string
}

// -----------------------------
// AUTH MIDDLEWARE
// -----------------------------
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  // =============================
  // 1. CHECK TOKEN EXISTS
  // =============================
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    // =============================
    // 2. VERIFY TOKEN
    // =============================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      })
    }

    // =============================
    // 3. OPTIONAL: DB FALLBACK (RECOMMENDED FIX)
    //    → solves your stationId issue permanently
    // =============================
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        stationId: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      })
    }

    // =============================
    // 4. ATTACH USER TO REQUEST
    // =============================
    req.user = {
      id: user.id,
      role: user.role,
      stationId: user.stationId ?? decoded.stationId, // fallback safety
    }

    // =============================
    // 5. DEBUG (REMOVE IN PROD)
    // =============================
    console.log("🔐 AUTH USER:", req.user)

    next()
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
      error: err?.message,
    })
  }
}