import { FuelRequestStatus } from "@prisma/client";
import { CreateFuelRequestDTO } from "./fuelRequests.types";
import {
  buildFuelRequestContext,
  validateFuelRequest,
} from "../publics/rules";
import prisma from "../../config/db";
import { applyRiskEngine } from "../publics/rules/risk/risk.engine";
import { fuelRequestRepository } from "./fuelRequests.repository";
import { calculateDistance, Coordinates } from "../../utils/distance";

export const fuelRequestService = {
  createRequest: async (
    userId: string,
    data: CreateFuelRequestDTO,
    distanceKm: number
  ) => {
    // =========================
    // 1. BUILD CONTEXT
    // =========================
    const ctx = await buildFuelRequestContext({
      userId,
      vehicleId: data.vehicleId,
      stationId: data.stationId,
      requestedLiters: data.requestedLiters,
      distanceKm,
    });
  
    // =========================
    // 2. RULE ENGINE (SINGLE SOURCE OF TRUTH)
    // =========================
    const ruleResult = validateFuelRequest(ctx);
  
    if (!ruleResult.valid) {
      throw new Error(ruleResult.reason || "RULE_VALIDATION_FAILED");
    }
  
    // =========================
    // 3. PERSIST REQUEST (RACE SAFE)
    // =========================
    const request = await prisma.$transaction(async (tx) => {
      // 🔒 PostgreSQL VEHICLE LOCK
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${data.vehicleId}))
      `;
  
      const activeRequest = await tx.fuelRequest.findFirst({
        where: {
          vehicleId: data.vehicleId,
          status: {
            in: [
              FuelRequestStatus.PENDING,
              FuelRequestStatus.APPROVED,
              FuelRequestStatus.VERIFIED,
            ],
          },
        },
      });
  
      if (activeRequest) {
        throw new Error("ACTIVE_FUEL_REQUEST_EXISTS");
      }
  
      if (data.requestedLiters <= 0) {
        throw new Error("INVALID_FUEL_AMOUNT");
      }
  
      return tx.fuelRequest.create({
        data: {
          userId,
          vehicleId: data.vehicleId,
          stationId: data.stationId,
          fuelTypeId: ctx.vehicle.fuelTypeId,
          requestedLiters: data.requestedLiters,
          status: FuelRequestStatus.PENDING,
        },
      });
    });
  
    // =========================
    // 4. RISK ENGINE (ASYNC)
    // =========================
    applyRiskEngine({
      userId,
      vehicleId: data.vehicleId,
      requestApproved: true,
      distanceKm,
      requestedLiters: data.requestedLiters,
      recentRequestsCount: ctx.refillsToday,
      consecutiveFailures: 0,
    }).catch((err) => {
      console.error("Risk engine failed:", err);
    });
  
    return request;
  },


  // =========================
  // APPROVE REQUEST
  // =========================
  approveRequest: async (id: string, approvedLiters: number) => {
    const request = await fuelRequestRepository.findById(id);

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== FuelRequestStatus.PENDING) {
      throw new Error("Request already processed");
    }

    return fuelRequestRepository.update(id, {
      approvedLiters,
      status: FuelRequestStatus.APPROVED,
    });
  },

  // =========================
  // GET ALL
  // =========================
  getAllRequests: async () => {
    return fuelRequestRepository.findAll();
  },

  // =========================
  // GET BY ID
  // =========================
  getRequestById: async (id: string) => {
    const request = await fuelRequestRepository.findById(id);

    if (!request) {
      throw new Error("Request not found");
    }

    return request;
  },


  /**
   * Calculate distance (reusable domain function)
   */
  calculateDistanceToStation: async (
    stationId: string,
    userCoords: Coordinates
  ): Promise<number> => {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: { lat: true, lng: true },
    });

    if (!station) {
      throw new Error("STATION_NOT_FOUND");
    }

    return calculateDistance(
      userCoords,
      {
        lat: Number(station.lat),
        lng: Number(station.lng),
      },
      "km"
    );
  },
};