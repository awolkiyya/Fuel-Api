export function checkDailyFuelLimit(
  used: number,
  incoming: number,
  max: number
): boolean {
  return used + incoming <= max;
}

export function checkMaxRefillsPerDay(
  refills: number,
  maxRefills?: number | null
): boolean {
  if (!maxRefills) return true;
  return refills < maxRefills;
}

export function checkMinRefillInterval(
  lastRefill: Date | null,
  now: Date,
  minMinutes?: number | null
): boolean {
  if (!minMinutes) return true;
  if (!lastRefill) return true;

  const diff = (now.getTime() - lastRefill.getTime()) / 60000;
  return diff >= minMinutes;
}

export function checkHourlyFuelLimit(
  used: number,
  incoming: number,
  max?: number | null
): boolean {
  if (!max) return true;
  return used + incoming <= max;
}