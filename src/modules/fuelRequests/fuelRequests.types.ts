import { FuelRequestStatus } from "@prisma/client";



// the dto to request fuel
export type CreateFuelRequestDTO = {
  vehicleId: string;
  stationId: string;
  fuelTypeId: string;
  requestedLiters: number;
};

// the dto to approve the request by fuel station manager 
export type ApproveFuelRequestDTO = {
  approvedLiters: number;
};

// the dto to reject the fuel request
export type RejectFuelRequestDTO = {
  rejectionReasonId: string;
  rejectionNote?: string;
};

// the dto to response the fuel request
  

export type FuelRequestResponse = {
  id: string;

  // 👇 requester (driver)
  userId: string;

  vehicleId: string;
  stationId: string;
  fuelTypeId: string;

  requestedLiters: number;
  approvedLiters: number | null;
  dispensedLiters?: number | null;

  status: FuelRequestStatus;

  // 👇 station operations
  assignedToId?: string | null;
  nozzleId?: string | null;

  // 👇 workflow tracking
  approvedAt?: Date | null;
  completedAt?: Date | null;

  // 👇 rejection info
  rejectionReasonId?: string | null;
  rejectionNote?: string | null;

  // 👇 timestamps
  createdAt: Date;
  updatedAt: Date;
};