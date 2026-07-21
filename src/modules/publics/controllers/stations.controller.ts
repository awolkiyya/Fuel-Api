import { Request, Response } from "express";
import prisma from "../../../config/db";
import { calculateDistance } from "../../../utils/distance";
import { normalizeParam } from "../../../utils/nortmilizer";
import { Prisma } from "@prisma/client";
import { calculateServiceCapacityScore } from "../../../utils/ServiceCapacityInput";
import { resolveFuelPrice } from "../../../rules/pricing.rules";
import { getSystemSettings } from "../../../utils/getSystemSettings";


/* =========================================================
   🚗 NEARBY STATIONS (CORE DRIVER FEATURE)
========================================================= */
export const getNearbyStations = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { lat, lng, radius = 5 } = req.query;
  
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }
  
      const userLat = Number(lat);
      const userLng = Number(lng);
      const radiusKm = Number(radius);
  
      const stations = await prisma.station.findMany({
        include: {
          traffic: true,
          fuelTypes: {
            include: {
              fuelType: true,
              tanks: true,
            },
          },
          stationFuelPrices: true,
        },
      });
  
      const data = stations
        .map((station) => {
          const distance = calculateDistance(
            { lat: userLat, lng: userLng },
            { lat: station.lat, lng: station.lng }
          );
  
          // ❌ filter outside radius
          if (distance > radiusKm) return null;
  
          const traffic = station.traffic;
  
          const fuelTypes = station.fuelTypes.map((ft) => {
            const price = station.stationFuelPrices.find(
              (p) => p.fuelTypeId === ft.fuelTypeId
            );
  
            const tank = ft.tanks?.[0];
  
            const remainingPercent =
              tank?.capacity && tank?.currentLevel
                ? Math.round((tank.currentLevel / tank.capacity) * 100)
                : 0;
  
            const stockStatus =
              remainingPercent > 60
                ? "GOOD"
                : remainingPercent > 20
                ? "MEDIUM"
                : "LOW";
  
            return {
              type: ft.fuelType.name,
              price: price?.pricePerLiter || ft.fuelType.price,
              available: ft.isActive,
              remainingPercent,
              stockStatus,
              queueCount: traffic?.queueCount || 0,
              estimatedWaitMinutes: traffic?.waitingTimeMin || 0,
              serviceCapacityScore: remainingPercent / 100,
            };
          });
  
          return {
            id: station.id,
            name: station.name,
            imageUrl: station.imageUrl,
  
            location: {
              lat: station.lat,
              lng: station.lng,
            },
  
            distance: Number(distance.toFixed(2)),
            address: station.address,
            status: station.status,
  
            traffic: {
              level: traffic?.congestionLevel || "LOW",
              queueCount: traffic?.queueCount || 0,
              estimatedWaitMinutes: traffic?.waitingTimeMin || 0,
            },
  
            fuelTypes,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.distance - b.distance);
  
      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get nearby stations",
      });
    }
  };

/* =========================================================
   🔎 SEARCH STATIONS (ENTERPRISE PRODUCTION READY)
========================================================= */

export const searchStations = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // =====================================================
    // 📥 QUERY PARAMS
    // =====================================================

    const {
      q = "",
      lat,
      lng,
      page = "1",
      limit = "20",
    } = req.query;

    // =====================================================
    // 🧹 SANITIZE INPUT
    // =====================================================

    const searchQuery = String(q).trim().toLowerCase();

    const currentPage = Math.max(Number(page) || 1, 1);

    const take = Math.min(Number(limit) || 20, 50);

    const skip = (currentPage - 1) * take;

    // =====================================================
    // 🌍 SAFE LOCATION PARSING
    // =====================================================

    const userLat = Number(lat);
    const userLng = Number(lng);

    const hasLocation =
      Number.isFinite(userLat) &&
      Number.isFinite(userLng);

    // =====================================================
    // ⚙️ SETTINGS (CACHE RECOMMENDED)
    // =====================================================

    const settings = await getSystemSettings(prisma);

    // =====================================================
    // 🔎 SEARCH WHERE CONDITION
    // =====================================================

    const whereCondition: Prisma.StationWhereInput =
      searchQuery
        ? {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                city: {
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                region: {
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                address: {
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                fuelTypes: {
                  some: {
                    fuelType: {
                      name: {
                        contains: searchQuery,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  },
                },
              },
            ],
          }
        : {};

    // =====================================================
    // 📦 FETCH STATIONS
    // =====================================================

    const stations = await prisma.station.findMany({
      where: whereCondition,

      skip,
      take,

      include: {
        traffic: true,

        dispensers: {
          select: {
            nozzles: {
              select: {
                status: true,
              },
            },
          },
        },

        fuelTypes: {
          include: {
            fuelType: true,

            tanks: {
              select: {
                capacity: true,
                currentLevel: true,
              },
              take: 1,
            },
          },
        },

        stationFuelPrices: true,
      },
    });

    // =====================================================
    // 🔢 TOTAL COUNT
    // =====================================================

    const total = await prisma.station.count({
      where: whereCondition,
    });

    // =====================================================
    // 🔄 TRANSFORM DATA
    // =====================================================

    const transformed = stations.map((station) => {
      // ===================================================
      // 📍 DISTANCE
      // ===================================================

      const distance = hasLocation
        ? calculateDistance(
            {
              lat: userLat,
              lng: userLng,
            },
            {
              lat: station.lat,
              lng: station.lng,
            }
          )
        : 0;

      // ===================================================
      // 🚦 TRAFFIC
      // ===================================================

      const traffic = station.traffic;

      // ===================================================
      // 🚗 NOZZLES
      // ===================================================

      const allNozzles =
        station.dispensers.flatMap(
          (d) => d.nozzles || []
        ) || [];

      const totalNozzles = allNozzles.length;

      const activeNozzles = allNozzles.filter(
        (n) => n.status === "active"
      ).length;

      const busyNozzles = allNozzles.filter(
        (n) => n.status === "busy"
      ).length;

      // ===================================================
      // ⛽ FUEL TYPES
      // ===================================================

      const fuelTypes = station.fuelTypes.map((ft) => {
        const override =
          station.stationFuelPrices.find(
            (p) => p.fuelTypeId === ft.fuelTypeId
          );

        const price = resolveFuelPrice(
          ft.fuelType,
          override || null,
          settings
        );

        const tank = ft.tanks?.[0];

        const remainingPercent =
          tank?.capacity && tank?.currentLevel
            ? Math.round(
                (tank.currentLevel / tank.capacity) *
                  100
              )
            : 0;

        const stockStatus =
          remainingPercent > 60
            ? "GOOD"
            : remainingPercent > 20
            ? "MEDIUM"
            : "LOW";

        return {
          id: ft.fuelType.id,

          type: ft.fuelType.name,

          available: ft.isActive,

          price,

          remainingPercent,

          stockStatus,

          queueCount:
            traffic?.queueCount ?? 0,

          estimatedWaitMinutes:
            traffic?.waitingTimeMin ?? 0,
        };
      });

      // ===================================================
      // 🧠 CAPACITY SCORE
      // ===================================================

      const stationCapacityScore =
        calculateServiceCapacityScore({
          totalNozzles,
          activeNozzles,
          busyNozzles,
          globalQueue:
            traffic?.queueCount ?? 0,
        });

      // ===================================================
      // 🧠 SEARCH RELEVANCE SCORE
      // ===================================================

      let relevanceScore = 0;

      const stationName =
        station.name?.toLowerCase() || "";

      const city =
        station.city?.toLowerCase() || "";

      const region =
        station.region?.toLowerCase() || "";

      const address =
        station.address?.toLowerCase() || "";

      if (searchQuery) {
        if (stationName === searchQuery)
          relevanceScore += 100;

        if (
          stationName.includes(searchQuery)
        )
          relevanceScore += 50;

        if (city.includes(searchQuery))
          relevanceScore += 20;

        if (region.includes(searchQuery))
          relevanceScore += 15;

        if (address.includes(searchQuery))
          relevanceScore += 10;

        fuelTypes.forEach((fuel) => {
          if (
            fuel.type
              .toLowerCase()
              .includes(searchQuery)
          ) {
            relevanceScore += 30;
          }
        });
      }

      // ===================================================
      // 📤 FINAL RESPONSE
      // ===================================================

      return {
        id: station.id,

        name: station.name,

        imageUrl: station.imageUrl,

        status: station.status,

        address: station.address,

        city: station.city,

        region: station.region,

        location: {
          lat: station.lat,
          lng: station.lng,
        },

        distance: Number(
          distance.toFixed(2)
        ),

        relevanceScore,

        traffic: {
          level:
            traffic?.congestionLevel ||
            "LOW",

          queueCount:
            traffic?.queueCount ?? 0,

          estimatedWaitMinutes:
            traffic?.waitingTimeMin ?? 0,
        },

        stationCapacityScore,

        fuelTypes,
      };
    });

    // =====================================================
    // 📊 SORTING
    // =====================================================

    const sorted = transformed.sort((a, b) => {
      // Higher relevance first
      if (
        b.relevanceScore !==
        a.relevanceScore
      ) {
        return (
          b.relevanceScore -
          a.relevanceScore
        );
      }

      // Nearest station second
      if (hasLocation) {
        return a.distance - b.distance;
      }

      return 0;
    });

    // =====================================================
    // 📤 RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      meta: {
        total,
        page: currentPage,
        limit: take,
        totalPages: Math.ceil(
          total / take
        ),
      },

      data: sorted,
    });
  } catch (error: any) {
    console.error(
      "SEARCH STATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to search stations",
    });
  }
};
/* =========================================================
   📍 STATION BY ID (FULL DETAIL)
========================================================= */
export const getStationById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stationId = normalizeParam(req.params.id);

    if (!stationId) {
      return res.status(400).json({
        success: false,
        message: "stationId is required",
      });
    }

    // =========================
    // ⚙️ SYSTEM SETTINGS
    // =========================
    const settings = await getSystemSettings(prisma);

    // =========================
    // 📦 FETCH STATION
    // =========================
    const station = await prisma.station.findUnique({
      where: {
        id: stationId,
      },
      include: {
        traffic: true,
        dispensers: {
          include: {
            nozzles: true,
          },
        },
        fuelTypes: {
          include: {
            fuelType: true,
            tanks: true,
          },
        },
        stationFuelPrices: true,
      },
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    const traffic = station.traffic;

    // =========================
    // 🚗 NOZZLES (GLOBAL)
    // =========================
    const allNozzles =
      station.dispensers?.flatMap((d) => d.nozzles ?? []) ?? [];

    const totalNozzles = allNozzles.length;

    const activeNozzles = allNozzles.filter(
      (n) => n.status === "active"
    ).length;

    const busyNozzles = allNozzles.filter(
      (n) => n.status === "busy"
    ).length;

    // =========================
    // ⛽ FUEL TRANSFORMATION (ENGINE)
    // =========================
    const fuelTypes = station.fuelTypes.map((ft) => {
      const stationOverride = station.stationFuelPrices.find(
        (p) => p.fuelTypeId === ft.fuelTypeId
      );

      const price = resolveFuelPrice(
        ft.fuelType,
        stationOverride ?? null,
        settings
      );

      const tank = ft.tanks?.[0];

      const remainingPercent =
        tank?.capacity && tank?.currentLevel
          ? Math.round(
              (tank.currentLevel / tank.capacity) * 100
            )
          : 0;

      const stockStatus =
        remainingPercent > 60
          ? "GOOD"
          : remainingPercent > 20
          ? "MEDIUM"
          : "LOW";

      return {
        type: ft.fuelType.name,
        price,
        available: ft.isActive,

        remainingPercent,
        stockStatus,

        queueCount: traffic?.queueCount ?? 0,
        estimatedWaitMinutes: traffic?.waitingTimeMin ?? 0,
      };
    });

    // =========================
    // 🧠 CAPACITY SCORE
    // =========================
    const stationCapacityScore = calculateServiceCapacityScore({
      totalNozzles,
      activeNozzles,
      busyNozzles,
      globalQueue: traffic?.queueCount ?? 0,
    });

    // =========================
    // 📍 FINAL RESPONSE (UNIFIED FORMAT)
    // =========================
    return res.json({
      success: true,
      data: {
        id: station.id,
        name: station.name,
        imageUrl: station.imageUrl,

        location: {
          lat: station.lat,
          lng: station.lng,
        },

        address: station.address,
        status: station.status,

        // 🚗 TRAFFIC
        traffic: {
          level: traffic?.congestionLevel ?? "LOW",
          queueCount: traffic?.queueCount ?? 0,
          estimatedWaitMinutes: traffic?.waitingTimeMin ?? 0,
        },

        // 🚗 CAPACITY
        stationCapacityScore,

        // 🚗 NOZZLE SUMMARY (useful for UI detail page)
        nozzles: {
          total: totalNozzles,
          active: activeNozzles,
          busy: busyNozzles,
        },

        // ⛽ FUEL DATA
        fuelTypes,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get station",
    });
  }
};

/* =========================================================
   ⛽ STATION FUELS (DEDICATED ENDPOINT - PRODUCTION READY)
========================================================= */


export const getStationFuels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stationId = req.params.id;

    // =========================
    // 🚨 VALIDATION
    // =========================
    if (!stationId || typeof stationId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid stationId is required",
      });
    }

    // =========================
    // ⚙️ GLOBAL SYSTEM SETTINGS (CACHED)
    // =========================
    const settings = await getSystemSettings(prisma);

    if (!settings) {
      return res.status(500).json({
        success: false,
        message: "System settings not configured",
      });
    }

    // =========================
    // 📦 FETCH STATION (SAFE + TYPE-SAFE)
    // =========================
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: {
        id: true,

        fuelTypes: {
          select: {
            isActive: true,
            fuelTypeId: true,

            fuelType: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },

            tanks: {
              select: {
                capacity: true,
                currentLevel: true,
              },
            },
          },
        },

        stationFuelPrices: {
          select: {
            fuelTypeId: true,
            pricePerLiter: true,
            isOverride: true,
          },
        },
      },
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    // =========================
    // ⛽ TRANSFORM FUELS (UI OPTIMIZED)
    // =========================
    const fuels = station.fuelTypes.map((ft) => {
      const stationOverride = station.stationFuelPrices.find(
        (p) => p.fuelTypeId === ft.fuelTypeId
      );

      // 💡 CENTRALIZED PRICING ENGINE
      const price = resolveFuelPrice(
        ft.fuelType,
        stationOverride ?? null,
        settings
      );

      // 🛢️ SAFE TANK CALCULATION
      const tank = ft.tanks?.[0];

      const remainingPercent =
        tank?.capacity && tank?.currentLevel
          ? Math.round((tank.currentLevel / tank.capacity) * 100)
          : 0;

      // 📊 STOCK STATE
      const stockStatus =
        remainingPercent > 60
          ? "GOOD"
          : remainingPercent > 20
          ? "MEDIUM"
          : "LOW";

      return {
        id: ft.fuelType.id,

        type: ft.fuelType.name,
        price,
        available: ft.isActive,

        remainingPercent,
        stockStatus,

        // 🔥 UI helper flags
        isLowStock: remainingPercent < 20,
        isCritical: remainingPercent < 10,
      };
    });

    // =========================
    // 📤 RESPONSE (CLEAN API CONTRACT)
    // =========================
    return res.json({
      success: true,
      data: fuels,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to get fuel data",
    });
  }
};