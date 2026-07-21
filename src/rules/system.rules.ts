import { SystemSettings } from "@prisma/client"

export function isSystemActive(settings: SystemSettings): boolean {
  return settings.systemActive
}

export function isAIEnabled(settings: SystemSettings): boolean {
  return settings.aiEnabled
}

export function canUseAI(confidence: number, settings: SystemSettings): boolean {
  return confidence >= settings.aiMinConfidence
}

export function getTrafficLevel(limit: SystemSettings, count: number) {
  if (count <= limit.maxTrafficLow) return "low"
  if (count <= limit.maxTrafficMedium) return "medium"
  if (count <= limit.maxTrafficHigh) return "high"
  return "critical"
}