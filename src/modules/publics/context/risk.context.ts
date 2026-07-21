    // ==============================
  // 🚨 MAIN RISK ENGINE
  // ==============================
  
  export type RiskEngineContext = {
    userId: string;
    vehicleId: string;
  
    ruleFailed?: string | null;
    requestApproved: boolean;
  
    distanceKm: number;
    requestedLiters: number;
  
    recentRequestsCount?: number;
    consecutiveFailures?: number;
  };