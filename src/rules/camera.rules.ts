import { Camera } from "@prisma/client"

export function isCameraActive(camera: Camera): boolean {
  return camera.isActive && camera.status === "online"
}

export function canRunAI(camera: Camera): boolean {
  return camera.aiEnabled && camera.isActive
}

export function isStreamValid(camera: Camera): boolean {
  return !!camera.host && camera.status !== "offline"
}