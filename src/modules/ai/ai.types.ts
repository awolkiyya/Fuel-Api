export type AIResponse = {
    station_id: string;
    queue_count: number;
    traffic_status: "low" | "medium" | "high" | "critical";
  };