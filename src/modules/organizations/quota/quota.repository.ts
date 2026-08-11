import prisma from "../../../config/db";

import type {
  CreateQuotaInput,
  UpdateQuotaInput,
} from "./quota.schema";

// =====================================================
// TYPES
// =====================================================

export interface QuotaListParams {
  where: any;
  skip: number;
  limit: number;
}

export type QuotaStatus =
  | "ACTIVE"
  | "EXHAUSTED"
  | "EXPIRED"
  | "CANCELLED";

// =====================================================
// SHARED SELECTS
// =====================================================

const organizationListSelect = {
  id: true,
  name: true,
  type: true,
  status: true,

  // Can this organization receive fuel?
  allowFuelAccess: true,

  // Does this organization require
  // an active quota before fueling?
  requiresQuota: true,

  // Maximum quantity allowed
  // in one fuel transaction.
  maxTransactionLiters: true,
} as const;

const fuelTypeListSelect = {
  id: true,
  name: true,
} as const;

// =====================================================
// QUOTA REPOSITORY
// =====================================================

export const quotaRepository = {
  // ===================================================
  // CREATE
  // ===================================================

  create: async (
    data: CreateQuotaInput,
  ) => {
    return prisma.fuelQuota.create({
      data: {
        organizationId:
          data.organizationId,

        fuelTypeId:
          data.fuelTypeId,

        periodType:
          data.periodType,

        startDate:
          data.startDate,

        endDate:
          data.endDate,

        allocatedLiters:
          data.allocatedLiters,

        // Always start at zero.
        consumedLiters: 0,

        assignedByUserId:
          data.assignedByUserId ??
          null,

        referenceNumber:
          data.referenceNumber ??
          null,

        remarks:
          data.remarks ??
          null,

        status: "ACTIVE",
      },

      include: {
        organization: {
          select:
            organizationListSelect,
        },

        fuelType: {
          select:
            fuelTypeListSelect,
        },
      },
    });
  },

  // ===================================================
  // FIND MANY
  // ===================================================

  findMany: async ({
    where,
    skip,
    limit,
  }: QuotaListParams) => {
    return prisma.fuelQuota.findMany({
      where,

      skip,

      take: limit,

      orderBy: [
        {
          startDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      include: {
        organization: {
          select:
            organizationListSelect,
        },

        fuelType: {
          select:
            fuelTypeListSelect,
        },
      },
    });
  },

  // ===================================================
  // COUNT
  // ===================================================

  count: async (
    where: any,
  ) => {
    return prisma.fuelQuota.count({
      where,
    });
  },

  // ===================================================
  // FIND BY ID
  // ===================================================

  findById: async (
    id: string,
  ) => {
    return prisma.fuelQuota.findUnique({
      where: {
        id,
      },

      include: {
        organization: {
          select:
            organizationListSelect,
        },

        fuelType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // ===================================================
  // FIND ACTIVE QUOTA
  // ===================================================

  findActiveQuota: async ({
    organizationId,
    fuelTypeId,
    date = new Date(),
  }: {
    organizationId: string;
    fuelTypeId: string;
    date?: Date;
  }) => {
    return prisma.fuelQuota.findFirst({
      where: {
        organizationId,

        fuelTypeId,

        status: "ACTIVE",

        startDate: {
          lte: date,
        },

        endDate: {
          gte: date,
        },
      },

      orderBy: [
        {
          startDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      include: {
        organization: {
          select:
            organizationListSelect,
        },

        fuelType: {
          select:
            fuelTypeListSelect,
        },
      },
    });
  },

  // ===================================================
  // FIND OVERLAPPING QUOTAS
  // ===================================================
  //
  // Two periods overlap when:
  //
  // existing.startDate <= requested.endDate
  //
  // AND
  //
  // existing.endDate >= requested.startDate
  //
  // CANCELLED quotas are ignored.
  //
  // ===================================================

  findOverlapping: async ({
    organizationId,
    fuelTypeId,
    startDate,
    endDate,
    excludeId,
  }: {
    organizationId: string;
    fuelTypeId: string;
    startDate: Date;
    endDate: Date;
    excludeId?: string;
  }) => {
    return prisma.fuelQuota.findMany({
      where: {
        organizationId,

        fuelTypeId,

        status: {
          not: "CANCELLED",
        },

        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),

        startDate: {
          lte: endDate,
        },

        endDate: {
          gte: startDate,
        },
      },

      select: {
        id: true,

        startDate: true,

        endDate: true,

        allocatedLiters: true,

        consumedLiters: true,

        status: true,
      },

      orderBy: {
        startDate: "asc",
      },
    });
  },

  // ===================================================
  // UPDATE
  // ===================================================

  update: async (
    id: string,
    data: UpdateQuotaInput,
  ) => {
    const updateData: Record<
      string,
      unknown
    > = {};

    if (
      data.fuelTypeId !==
      undefined
    ) {
      updateData.fuelTypeId =
        data.fuelTypeId;
    }

    if (
      data.periodType !==
      undefined
    ) {
      updateData.periodType =
        data.periodType;
    }

    if (
      data.startDate !==
      undefined
    ) {
      updateData.startDate =
        data.startDate;
    }

    if (
      data.endDate !==
      undefined
    ) {
      updateData.endDate =
        data.endDate;
    }

    if (
      data.allocatedLiters !==
      undefined
    ) {
      updateData.allocatedLiters =
        data.allocatedLiters;
    }

    if (
      data.referenceNumber !==
      undefined
    ) {
      updateData.referenceNumber =
        data.referenceNumber ??
        null;
    }

    if (
      data.remarks !==
      undefined
    ) {
      updateData.remarks =
        data.remarks ??
        null;
    }

    return prisma.fuelQuota.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        organization: {
          select:
            organizationListSelect,
        },

        fuelType: {
          select:
            fuelTypeListSelect,
        },
      },
    });
  },

  // ===================================================
  // UPDATE STATUS
  // ===================================================

  updateStatus: async (
    id: string,
    status: QuotaStatus,
  ) => {
    return prisma.fuelQuota.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include: {
        organization: {
          select:
            organizationListSelect,
        },

        fuelType: {
          select:
            fuelTypeListSelect,
        },
      },
    });
  },

  // ===================================================
  // UPDATE CONSUMED LITERS
  // ===================================================

  updateConsumedLiters: async ({
    id,
    consumedLiters,
  }: {
    id: string;
    consumedLiters: number;
  }) => {
    return prisma.fuelQuota.update({
      where: {
        id,
      },

      data: {
        consumedLiters,
      },
    });
  },

  // ===================================================
  // INCREMENT CONSUMED LITERS
  // ===================================================
  //
  // Used by the fuel transaction flow.
  //
  // IMPORTANT:
  // The transaction/service layer must make sure
  // consumption cannot exceed the quota.
  //
  // ===================================================

  incrementConsumedLiters: async ({
    id,
    liters,
  }: {
    id: string;
    liters: number;
  }) => {
    return prisma.fuelQuota.update({
      where: {
        id,
      },

      data: {
        consumedLiters: {
          increment: liters,
        },
      },
    });
  },

  // ===================================================
  // FIND ORGANIZATION
  // ===================================================

  findOrganization: async (
    organizationId: string,
  ) => {
    return prisma.organization.findUnique({
      where: {
        id: organizationId,
      },

      select: {
        id: true,

        name: true,

        type: true,

        status: true,

        // Fuel access master switch.
        allowFuelAccess: true,

        // Quota requirement.
        requiresQuota: true,

        // Maximum transaction amount.
        maxTransactionLiters: true,
      },
    });
  },

  // ===================================================
  // FIND FUEL TYPE
  // ===================================================

  findFuelType: async (
    fuelTypeId: string,
  ) => {
    return prisma.fuelType.findUnique({
      where: {
        id: fuelTypeId,
      },

      select: {
        id: true,
        name: true,
      },
    });
  },

  // ===================================================
  // DELETE
  // ===================================================
  //
  // Prefer CANCELLED status for production records.
  // Physical deletion should generally be restricted
  // to administrative cleanup.
  //
  // ===================================================

  delete: async (
    id: string,
  ) => {
    return prisma.fuelQuota.delete({
      where: {
        id,
      },
    });
  },
};