import { PrismaClient, SystemSettings } from "@prisma/client";

let cachedSettings: SystemSettings | null = null;
let lastFetchTime = 0;

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache refresh (adjust as needed)

/**
 * =========================
 * SYSTEM SETTINGS SERVICE
 * =========================
 */
export async function getSystemSettings(prisma: PrismaClient): Promise<SystemSettings> {
  const now = Date.now();

  // =========================
  // ⚡ CACHE VALIDATION
  // =========================
  if (cachedSettings && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  // =========================
  // 📦 FETCH FROM DB
  // =========================
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  });

  // =========================
  // 🛑 FALLBACK SAFETY
  // =========================
  if (!settings) {
    throw new Error("System settings (global) not found in database");
  }

  // =========================
  // 💾 UPDATE CACHE
  // =========================
  cachedSettings = settings;
  lastFetchTime = now;

  return settings;
}