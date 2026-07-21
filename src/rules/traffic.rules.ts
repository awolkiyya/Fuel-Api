import { SystemSettings } from "@prisma/client"

export function calculateCongestionLevel(
  count: number,
  settings: SystemSettings
): string {

  if (count <= settings.maxTrafficLow) return "low"
  if (count <= settings.maxTrafficMedium) return "medium"
  if (count <= settings.maxTrafficHigh) return "high"
  return "critical"
}

export function estimateWaitingTime(queueCount: number): number {
  // simple heuristic (can be replaced with AI later)
  return queueCount * 1.5
}