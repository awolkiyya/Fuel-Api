import prisma from "../../config/db";

import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "./organizations.schema";

// =====================================================
// TYPES
// =====================================================

export interface OrganizationListParams {
  where: any;
  skip: number;
  limit: number;
}

// =====================================================
// QUOTA SELECT
// =====================================================
//
// Lightweight quota representation returned with
// organization data.
//
// =====================================================

const organizationQuotaSelect = {
  id: true,

  organizationId: true,

  fuelTypeId: true,

  periodType: true,

  startDate: true,

  endDate: true,

  allocatedLiters: true,

  consumedLiters: true,

  status: true,

  assignedByUserId: true,

  referenceNumber: true,

  remarks: true,

  approvedAt: true,

  createdAt: true,

  updatedAt: true,

  fuelType: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

// =====================================================
// ORGANIZATION REPOSITORY
// =====================================================

export const organizationRepository = {
  // ===================================================
  // CREATE
  // ===================================================

  create: async (
    data: CreateOrganizationInput,
  ) => {
    return prisma.organization.create({
      data: {
        name: data.name,

        type: data.type,

        registrationNumber:
          data.registrationNumber ?? null,

        contactPerson:
          data.contactPerson ?? null,

        phone:
          data.phone ?? null,

        email:
          data.email ?? null,

        address:
          data.address ?? null,

        status:
          data.status ?? "ACTIVE",

        allowFuelAccess:
          data.allowFuelAccess ?? true,

        requiresQuota:
          data.requiresQuota ?? true,

        maxTransactionLiters:
          data.maxTransactionLiters ?? 5000,

        apiKey:
          data.apiKey ?? null,
      },

      include: {
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
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
  }: OrganizationListParams) => {
    return prisma.organization.findMany({
      where,
  
      skip,
  
      take: limit,
  
      orderBy: {
        createdAt: "desc",
      },
  
      select: {
        id: true,
  
        name: true,
  
        type: true,
  
        registrationNumber: true,
  
        contactPerson: true,
  
        phone: true,
  
        email: true,
  
        address: true,
  
        status: true,
  
        allowFuelAccess: true,
  
        requiresQuota: true,
  
        maxTransactionLiters: true,
  
        createdAt: true,
  
        updatedAt: true,
  
        // =================================================
        // QUOTA LIST
        // =================================================
  
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],
  
          select: {
            id: true,
  
            organizationId: true,
  
            fuelTypeId: true,
  
            periodType: true,
  
            startDate: true,
  
            endDate: true,
  
            allocatedLiters: true,
  
            consumedLiters: true,
  
            status: true,
  
            assignedByUserId: true,
  
            referenceNumber: true,
  
            remarks: true,
  
            approvedAt: true,
  
            createdAt: true,
  
            updatedAt: true,
  
            // ---------------------------------------------
            // FUEL TYPE
            // ---------------------------------------------
  
            fuelType: {
              select: {
                id: true,
  
                name: true,
              },
            },
          },
        },
  
        // =================================================
        // COUNTS
        // =================================================
  
        _count: {
          select: {
            fuelQuotas: true,
  
            fuelTransactions: true,
          },
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
    return prisma.organization.count({
      where,
    });
  },

  // ===================================================
  // FIND BY ID
  // ===================================================

  findById: async (
    id: string,
  ) => {
    return prisma.organization.findUnique({
      where: {
        id,
      },

      select: {
        id: true,

        name: true,

        type: true,

        registrationNumber: true,

        contactPerson: true,

        phone: true,

        email: true,

        address: true,

        status: true,

        allowFuelAccess: true,

        requiresQuota: true,

        maxTransactionLiters: true,

        apiKey: true,

        createdAt: true,

        updatedAt: true,

        // =================================================
        // ORGANIZATION QUOTAS
        // =================================================

        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        // =================================================
        // COUNTS
        // =================================================

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
        },
      },
    });
  },

  // ===================================================
  // UPDATE
  // ===================================================

  update: async (
    id: string,
    data: UpdateOrganizationInput,
  ) => {
    const updateData: Record<
      string,
      unknown
    > = {};

    if (data.name !== undefined) {
      updateData.name =
        data.name;
    }

    if (data.type !== undefined) {
      updateData.type =
        data.type;
    }

    if (
      data.registrationNumber !==
      undefined
    ) {
      updateData.registrationNumber =
        data.registrationNumber ??
        null;
    }

    if (
      data.contactPerson !==
      undefined
    ) {
      updateData.contactPerson =
        data.contactPerson ??
        null;
    }

    if (data.phone !== undefined) {
      updateData.phone =
        data.phone ?? null;
    }

    if (data.email !== undefined) {
      updateData.email =
        data.email ?? null;
    }

    if (data.address !== undefined) {
      updateData.address =
        data.address ?? null;
    }

    if (data.status !== undefined) {
      updateData.status =
        data.status;
    }

    if (
      data.allowFuelAccess !==
      undefined
    ) {
      updateData.allowFuelAccess =
        data.allowFuelAccess;
    }

    if (
      data.requiresQuota !==
      undefined
    ) {
      updateData.requiresQuota =
        data.requiresQuota;
    }

    if (
      data.maxTransactionLiters !==
      undefined
    ) {
      updateData.maxTransactionLiters =
        data.maxTransactionLiters;
    }

    if (data.apiKey !== undefined) {
      updateData.apiKey =
        data.apiKey ?? null;
    }

    return prisma.organization.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
        },
      },
    });
  },

  // ===================================================
  // UPDATE STATUS
  // ===================================================

  updateStatus: async (
    id: string,
    status: string,
  ) => {
    return prisma.organization.update({
      where: {
        id,
      },

      data: {
        status: status as any,
      },

      include: {
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
        },
      },
    });
  },

  // ===================================================
  // UPDATE FUEL ACCESS
  // ===================================================

  updateFuelAccess: async (
    id: string,
    allowFuelAccess: boolean,
  ) => {
    return prisma.organization.update({
      where: {
        id,
      },

      data: {
        allowFuelAccess,
      },

      include: {
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
        },
      },
    });
  },

  // ===================================================
  // UPDATE FUEL POLICY
  // ===================================================

  updateFuelPolicy: async (
    id: string,
    data: {
      requiresQuota?: boolean;
      maxTransactionLiters?: number;
    },
  ) => {
    const updateData: Record<
      string,
      unknown
    > = {};

    if (
      data.requiresQuota !==
      undefined
    ) {
      updateData.requiresQuota =
        data.requiresQuota;
    }

    if (
      data.maxTransactionLiters !==
      undefined
    ) {
      updateData.maxTransactionLiters =
        data.maxTransactionLiters;
    }

    return prisma.organization.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
        },
      },
    });
  },

  // ===================================================
  // DELETE
  // ===================================================

  delete: async (
    id: string,
  ) => {
    return prisma.organization.delete({
      where: {
        id,
      },
    });
  },

  // ===================================================
  // EXISTS
  // ===================================================

  exists: async (
    id: string,
  ) => {
    const organization =
      await prisma.organization.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
        },
      });

    return Boolean(
      organization,
    );
  },

  // ===================================================
  // FIND BY REGISTRATION NUMBER
  // ===================================================

  findByRegistrationNumber: async (
    registrationNumber: string,
  ) => {
    return prisma.organization.findUnique({
      where: {
        registrationNumber,
      },

      select: {
        id: true,

        name: true,

        registrationNumber: true,

        status: true,

        allowFuelAccess: true,

        requiresQuota: true,
      },
    });
  },

  // ===================================================
  // FIND BY API KEY
  // ===================================================

  findByApiKey: async (
    apiKey: string,
  ) => {
    return prisma.organization.findUnique({
      where: {
        apiKey,
      },

      include: {
        fuelQuotas: {
          orderBy: [
            {
              startDate: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          select:
            organizationQuotaSelect,
        },

        _count: {
          select: {
            fuelQuotas: true,

            fuelTransactions: true,
          },
        },
      },
    });
  },
};