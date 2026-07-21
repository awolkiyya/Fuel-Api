export type RiskLevel = "low" | "medium" | "high";

export type RiskInput = {
  ruleFailed?: string | null;
  requestApproved: boolean;
  distanceKm: number;
  requestedLiters: number;
  recentRequestsCount?: number;
  consecutiveFailures?: number;
};

export function calculateRiskScore(input: RiskInput): number {
  let score = 0;

  if (input.ruleFailed) score += 30;
  if (!input.requestApproved) score += 20;

  if (input.distanceKm > 50) score += 10;
  if (input.requestedLiters > 100) score += 10;

  if ((input.consecutiveFailures ?? 0) >= 3) score += 25;
  if ((input.recentRequestsCount ?? 0) > 5) score += 15;

  return score;
}

export function mapRiskLevel(score: number): RiskLevel {
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}