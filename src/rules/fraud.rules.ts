export function detectFuelMismatch(
    expectedLiters: number,
    actualLiters: number
  ): boolean {
    return Math.abs(expectedLiters - actualLiters) > 0.5
  }
  
  export function detectPriceManipulation(
    resolvedPrice: number,
    transactionPrice: number
  ): boolean {
    return resolvedPrice !== transactionPrice
  }
  
  export function detectAbnormalFlowRate(liters: number, timeSec: number): boolean {
    const rate = liters / timeSec
    return rate > 2 || rate < 0.1 // unrealistic thresholds
  }