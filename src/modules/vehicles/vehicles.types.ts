import type {
  VehicleType,
  FuelType,
  VehicleOwnershipStatus,
} from "@prisma/client";

import type { Express } from "express";

// =====================================================
// CREATE VEHICLE DATA
// =====================================================

export type CreateVehicleDTO = {
  userId: string;

  vehicleTypeId: string;
  fuelTypeId: string;

  plateNumber: string;
  regionCode: string;

  fuelCapacity: number;
  vin: string;
};

// =====================================================
// CREATE VEHICLE INPUT
// =====================================================
//
// Application/service input.
//
// The document belongs to the ownership-document
// workflow and must NOT be passed directly to
// prisma.vehicle.create().
//

export type CreateVehicleInput = {
  data: CreateVehicleDTO;

  document: Express.Multer.File;

  ownershipNumber?: string;
};

// =====================================================
// UPDATE VEHICLE DATA
// =====================================================

export type UpdateVehicleDTO = {
  vehicleTypeId?: string;
  fuelTypeId?: string;

  plateNumber?: string;
  regionCode?: string;

  fuelCapacity?: number;
  vin?: string;
};

// =====================================================
// UPDATE VEHICLE INPUT
// =====================================================

export type UpdateVehicleInput = {
  data: UpdateVehicleDTO;

  // Present only when the user uploads a
  // replacement ownership document.
  document?: Express.Multer.File;

  ownershipNumber?: string;
};

// =====================================================
// VEHICLE RESPONSE
// =====================================================

export type VehicleResponse = {
  id: string;
  userId: string;

  vehicleTypeId: string;
  fuelTypeId: string;

  plateNumber: string;
  regionCode: string;

  fuelCapacity: number;
  vin: string;

  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;

  vehicleType?: VehicleType;
  fuelType?: FuelType;

  ownershipDocument?: {
    id: string;
    vehicleId: string;

    ownershipNumber: string | null;
    documentUrl: string;

    status: VehicleOwnershipStatus;

    verifiedBy: string | null;
    verifiedAt: Date | null;
    rejectionReason: string | null;

    createdAt: Date;
    updatedAt: Date;
  } | null;
};