export interface ServiceCapacityInput {
    totalNozzles: number;
    activeNozzles: number;
    busyNozzles: number;
    globalQueue: number;
  }
  
  /**
   * 🚗 Realistic station service capacity score (0 → 1)
   * based on nozzle availability + global queue pressure
   */
  export function calculateServiceCapacityScore({
    totalNozzles,
    activeNozzles,
    busyNozzles,
    globalQueue,
  }: ServiceCapacityInput): number {
    if (totalNozzles <= 0) return 0;
  
    // =========================
    // 🔧 Service capacity from nozzles
    // =========================
    const nozzleScore =
      activeNozzles / totalNozzles;
  
    // =========================
    // 🚗 Global queue pressure
    // (higher queue = lower score)
    // =========================
    const queuePenalty = Math.min(globalQueue * 0.03, 0.5);
  
    // =========================
    // 📉 FINAL SCORE
    // =========================
    const score = nozzleScore - queuePenalty;
  
    return Math.max(0, Math.min(1, score));
  }