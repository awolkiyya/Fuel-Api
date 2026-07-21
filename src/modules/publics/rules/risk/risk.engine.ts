import {
  calculateRiskScore,
  mapRiskLevel,
  RiskLevel,
} from "./risk.scoring";

import {
  createUserRisk,
  getActiveUserRisk,
  escalateRisk,
} from "./risk.actions";

import { RiskEngineContext } from "../../context/risk.context";

export async function applyRiskEngine(ctx: RiskEngineContext) {
  // ==============================
  // 1. SCORE CALCULATION
  // ==============================
  const score = calculateRiskScore({
    ruleFailed: ctx.ruleFailed,
    requestApproved: ctx.requestApproved,
    distanceKm: ctx.distanceKm,
    requestedLiters: ctx.requestedLiters,
    recentRequestsCount: ctx.recentRequestsCount,
    consecutiveFailures: ctx.consecutiveFailures,
  });

  // ==============================
  // 2. RISK LEVEL MAPPING
  // ==============================
  const newLevel = mapRiskLevel(score) as RiskLevel;

  if (!newLevel) {
    throw new Error("INVALID_RISK_SCORE_MAPPING");
  }

  // ==============================
  // 3. GET EXISTING ACTIVE RISK
  // ==============================
  const existing = await getActiveUserRisk(ctx.userId);

  let finalLevel: RiskLevel = newLevel;

  // ==============================
  // 4. ESCALATION LOGIC (NO DOWNGRADE POLICY)
  // ==============================
  if (existing?.level) {
    finalLevel = escalateRisk(
      existing.level as RiskLevel,
      newLevel
    );
  }

  // ==============================
  // 5. PERSIST RISK EVENT
  // ==============================
  await createUserRisk({
    userId: ctx.userId,
    level: finalLevel,
    reason: ctx.ruleFailed ?? "SYSTEM_DETECTED_BEHAVIOR",
    detectedBy: "system",
  });

  // ==============================
  // 6. RETURN INSIGHT (for API/debug/AI)
  // ==============================
  return {
    score,
    level: finalLevel,
    escalated: finalLevel !== newLevel,
  };
}