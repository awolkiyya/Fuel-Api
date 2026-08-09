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

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.registrationNumber !== undefined) {
      updateData.registrationNumber =
        data.registrationNumber ?? null;
    }

    if (data.contactPerson !== undefined) {
      updateData.contactPerson =
        data.contactPerson ?? null;
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
      updateData.status = data.status;
    }

    if (data.allowFuelAccess !== undefined) {
      updateData.allowFuelAccess =
        data.allowFuelAccess;
    }

    if (data.requiresQuota !== undefined) {
      updateData.requiresQuota =
        data.requiresQuota;
    }

    if (data.maxTransactionLiters !== undefined) {
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

    const updateData: Record<string, unknown> = {};

    if (data.requiresQuota !== undefined) {
      updateData.requiresQuota =
        data.requiresQuota;
    }

    if (
      data.maxTransactionLiters !== undefined
    ) {
      updateData.maxTransactionLiters =
        data.maxTransactionLiters;
    }

    return prisma.organization.update({
      where: {
        id,
      },

      data: updateData,
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

    return Boolean(organization);
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
    });
  },
};