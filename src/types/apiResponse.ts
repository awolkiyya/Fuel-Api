/* ---------------------------------
   META (PAGINATION)
---------------------------------- */
export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/* ---------------------------------
   GENERIC API RESPONSE
---------------------------------- */
export type ApiResponse<T = any, S = unknown> = {
  success: boolean;
  message?: string;

  data: T | null;

  meta?: Meta;

  summary?: S; // 👈 added for aggregated stats (fuel, dashboard, etc.)
};