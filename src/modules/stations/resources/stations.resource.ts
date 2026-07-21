import { Prisma } from "@prisma/client"

export type StationResourceType = {
  id: string;

  managerId?: string | null;

  name: string;
  address?: string | null;
  city: string;
  region: string;

  lat: number;
  lng: number;

  imageUrl?: string | null;

  status: "ACTIVE" | "CONGESTED" | "RISK" | "INACTIVE" | "DELETED";

  isActive: boolean;
  isDeleted?: boolean;

  queue: number;
  staff: number;
  risk: "LOW" | "MEDIUM" | "HIGH" | "NONE";

  manager?: {
    id: string;
    name: string;
    phone?: string;
  } | null;

  // ================= FUEL INVENTORY =================
  fuelInventory: {
    fuelTypeId: string;
    type: string;
    maxCapacity: number;
    level: number;
    isActive: boolean; // ✅ ADD THIS
  }[];

  cameras: {
    id: string;
    name: string;
    streamUrl: string;
    type: "rtsp" | "http" | "webrtc" | "mobile_mock";
    location?: string | null;
    status: "online" | "offline" | "testing";
  }[];

  createdAt: Date;
  updatedAt: Date;
};

export const StationResource = {
  toResponse(station: any): StationResourceType {
    return {
      id: station.id,

      managerId: station.managerId ?? null,

      name: station.name,
      address: station.address ?? null,
      city: station.city,
      region: station.region,

      lat: station.lat,
      lng: station.lng,

      imageUrl: station.imageUrl ?? null,

      status: station.status?.toUpperCase(),

      isActive: station.isActive,
      isDeleted: station.isDeleted ?? false,

      queue: station.queue ?? 0,
      staff: station.staff ?? 0,
      risk: (station.risk || "LOW").toUpperCase(),

      manager: station.manager
        ? {
            id: station.manager.id,
            name: station.manager.full_name || station.manager.name,
            phone: station.manager.phone,
          }
        : null,

      // =====================================================
      // FUEL INVENTORY (CONFIG + LIVE LEVEL FROM TANKS)
      // =====================================================
      fuelInventory:
        station.fuelTypes?.map((f: any) => {
          const level = (f.tanks ?? []).reduce(
            (sum: number, t: any) => sum + (t.currentLevel ?? 0),
            0
          );

          return {
            fuelTypeId: f.fuelType.id,
            type: f.fuelType.name,
            maxCapacity: f.maxCapacity,
            level,
            isActive: f.isActive, // ✅ IMPORTANT FIX
          };
        }) ?? [],

      // ================= ACTIVE CAMERAS =================
      cameras:
        (station.cameras ?? [])
          .filter((c: any) => c.isActive)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            streamUrl: c.streamUrl,
            type: c.type,
            location: c.location ?? null,
            status: c.status,
          })),

      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    };
  },

  toResponseList(stations: any[]) {
    return stations.map((s) => this.toResponse(s));
  },
};



type FuelTypeWithTanks =
  Prisma .StationFuelTypeGetPayload<{
    include: {
      fuelType: true
      tanks: {
        select: {
          currentLevel: true
        }
      }
    }
  }>

export class StationFuelResource {
  static toResponse(item: FuelTypeWithTanks) {
    const allocated = item.tanks.reduce(
      (sum, t) => sum + (t.currentLevel ?? 0),
      0
    )

    const remaining = item.maxCapacity - allocated

    const utilization =
      item.maxCapacity > 0
        ? Math.round((allocated / item.maxCapacity) * 100)
        : 0

    return {
      id: item.id,

      fuelType: {
        id: item.fuelType.id,
        name: item.fuelType.name,
      },

      maxCapacity: item.maxCapacity,

      allocated,
      remaining,
      utilization,

      isActive: item.isActive,

      tanks: item.tanks.map((t) => ({
        currentLevel: t.currentLevel,
      })),
    }
  }

  static toResponseList(items: FuelTypeWithTanks[]) {
    return items.map(this.toResponse)
  }
}


export type FuelConfigUpdateDTO = {
  fuelTypeId: string;
  isActive: boolean;
  min: number;
  max: number;
  maxCapacity: number;
  price?: number;
};