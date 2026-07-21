import prisma from "../../../../config/db";
import { RiskLevel } from "./risk.scoring";

// ==============================
// 🚨 CREATE RISK ENTRY
// ==============================
export async function createUserRisk(params: {
  userId: string;
  level: RiskLevel;
  reason: string;
  detectedBy?: string;
}) {
  return prisma.userRisk.create({
    data: {
      userId: params.userId,
      level: params.level,
      status: params.level === "high" ? "flagged" : "active",
      reason: params.reason,
      detectedBy: params.detectedBy ?? "system",
    },
  });
}

// ==============================
// 📊 GET CURRENT ACTIVE RISK
// ==============================
export async function getActiveUserRisk(userId: string) {
  return prisma.userRisk.findFirst({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ==============================
// 🔄 ESCALATION LOGIC (NO DOWNGRADE RULE)
// ==============================
export function escalateRisk(
  currentLevel: RiskLevel,
  newLevel: RiskLevel
): RiskLevel {
  const order: RiskLevel[] = ["low", "medium", "high"];

  const currentIndex = order.indexOf(currentLevel);
  const newIndex = order.indexOf(newLevel);

  return order[Math.max(currentIndex, newIndex)];
}