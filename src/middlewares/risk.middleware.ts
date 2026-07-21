import { Request, Response, NextFunction } from "express";
import { getActiveUserRisk } from "../modules/publics/rules/risk/risk.actions";

/**
 * ==============================
 * 🚨 RISK ENFORCEMENT MIDDLEWARE
 * ==============================
 * - Reads latest user risk state
 * - Enforces access rules
 * - Attaches risk context to request
 */

export async function riskMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "UNAUTHORIZED",
      });
    }

    // =========================
    // 1. GET ACTIVE RISK
    // =========================
    const risk = await getActiveUserRisk(userId);

    // Attach for downstream usage
    (req as any).risk = risk;

    // =========================
    // 2. NO RISK = ALLOW
    // =========================
    if (!risk) {
      return next();
    }

    // =========================
    // 3. ENFORCEMENT RULES
    // =========================
    switch (risk.level) {
      case "high":
        return res.status(403).json({
          success: false,
          message: "ACCESS_BLOCKED_DUE_TO_HIGH_RISK",
          risk: {
            level: risk.level,
            reason: risk.reason,
          },
        });

      case "medium":
        // allow but mark restricted mode
        (req as any).riskRestricted = true;
        break;

      case "low":
      default:
        break;
    }

    return next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "RISK_MIDDLEWARE_ERROR",
    });
  }
}