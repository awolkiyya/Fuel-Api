import { organizationRepository } from "./organizations.repository";

import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationStatusInput,
  UpdateOrganizationFuelAccessInput,
  UpdateOrganizationFuelPolicyInput,
  GetOrganizationsQuery,
} from "./organizations.schema";


// =====================================================
// SERVICE ERROR
// =====================================================

class OrganizationServiceError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400,
  ) {
    super(message);

    this.name = "OrganizationServiceError";
    this.statusCode = statusCode;
  }
}


// =====================================================
// ORGANIZATION SERVICE
// =====================================================

export const organizationService = {

  // ===================================================
  // CREATE ORGANIZATION
  // ===================================================

  create: async (
    data: CreateOrganizationInput,
  ) => {

    // -----------------------------------------------
    // CHECK DUPLICATE REGISTRATION NUMBER
    // -----------------------------------------------

    if (data.registrationNumber) {
      const existing =
        await organizationRepository.findByRegistrationNumber(
          data.registrationNumber,
        );

      if (existing) {
        throw new OrganizationServiceError(
          "An organization with this registration number already exists.",
          409,
        );
      }
    }


    // -----------------------------------------------
    // CREATE
    // -----------------------------------------------

    return organizationRepository.create(data);
  },


  // ===================================================
  // GET ORGANIZATIONS
  // ===================================================

  getAll: async (
    query: GetOrganizationsQuery,
  ) => {

    const {
      page,
      limit,
      search,
      status,
      type,
      allowFuelAccess,
      requiresQuota,
    } = query;


    // -----------------------------------------------
    // PAGINATION
    // -----------------------------------------------

    const skip = (page - 1) * limit;


    // -----------------------------------------------
    // WHERE
    // -----------------------------------------------

    const where: Record<string, any> = {};


    // -----------------------------------------------
    // SEARCH
    // -----------------------------------------------

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          registrationNumber: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          contactPerson: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }


    // -----------------------------------------------
    // STATUS FILTER
    // -----------------------------------------------

    if (status) {
      where.status = status;
    }


    // -----------------------------------------------
    // TYPE FILTER
    // -----------------------------------------------

    if (type) {
      where.type = type;
    }


    // -----------------------------------------------
    // FUEL ACCESS FILTER
    // -----------------------------------------------

    if (allowFuelAccess !== undefined) {
      where.allowFuelAccess =
        allowFuelAccess;
    }


    // -----------------------------------------------
    // QUOTA FILTER
    // -----------------------------------------------

    if (requiresQuota !== undefined) {
      where.requiresQuota =
        requiresQuota;
    }


    // -----------------------------------------------
    // QUERY
    // -----------------------------------------------

    const [organizations, total] =
      await Promise.all([
        organizationRepository.findMany({
          where,
          skip,
          limit,
        }),

        organizationRepository.count(where),
      ]);


    // -----------------------------------------------
    // PAGINATION META
    // -----------------------------------------------

    const totalPages =
      Math.ceil(total / limit);


    return {
      data: organizations,

      meta: {
        page,
        limit,
        total,
        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  },


  // ===================================================
  // GET ORGANIZATION BY ID
  // ===================================================

  getById: async (
    id: string,
  ) => {

    const organization =
      await organizationRepository.findById(id);


    if (!organization) {
      throw new OrganizationServiceError(
        "Organization not found.",
        404,
      );
    }


    return organization;
  },


  // ===================================================
  // UPDATE ORGANIZATION
  // ===================================================

  update: async (
    id: string,
    data: UpdateOrganizationInput,
  ) => {

    // -----------------------------------------------
    // CHECK ORGANIZATION
    // -----------------------------------------------

    const existing =
      await organizationRepository.findById(id);


    if (!existing) {
      throw new OrganizationServiceError(
        "Organization not found.",
        404,
      );
    }


    // -----------------------------------------------
    // CHECK REGISTRATION NUMBER
    // -----------------------------------------------

    if (
      data.registrationNumber &&
      data.registrationNumber !==
        existing.registrationNumber
    ) {

      const duplicate =
        await organizationRepository
          .findByRegistrationNumber(
            data.registrationNumber,
          );


      if (
        duplicate &&
        duplicate.id !== id
      ) {
        throw new OrganizationServiceError(
          "An organization with this registration number already exists.",
          409,
        );
      }
    }


    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    return organizationRepository.update(
      id,
      data,
    );
  },


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  updateStatus: async (
    id: string,
    data: UpdateOrganizationStatusInput,
  ) => {

    const organization =
      await organizationRepository.findById(id);


    if (!organization) {
      throw new OrganizationServiceError(
        "Organization not found.",
        404,
      );
    }


    // -----------------------------------------------
    // PREVENT UNNECESSARY UPDATE
    // -----------------------------------------------

    if (
      organization.status === data.status
    ) {
      return organization;
    }


    // -----------------------------------------------
    // STATUS RULES
    // -----------------------------------------------

    // A blocked organization should not be
    // automatically reactivated through the
    // normal status endpoint.

    if (
      organization.status === "BLOCKED" &&
      data.status === "ACTIVE"
    ) {
      throw new OrganizationServiceError(
        "A blocked organization cannot be directly reactivated.",
        400,
      );
    }


    return organizationRepository.updateStatus(
      id,
      data.status,
    );
  },


  // ===================================================
  // UPDATE FUEL ACCESS
  // ===================================================

  updateFuelAccess: async (
    id: string,
    data: UpdateOrganizationFuelAccessInput,
  ) => {

    const organization =
      await organizationRepository.findById(id);


    if (!organization) {
      throw new OrganizationServiceError(
        "Organization not found.",
        404,
      );
    }


    // -----------------------------------------------
    // BLOCKED ORGANIZATION
    // -----------------------------------------------

    if (
      organization.status === "BLOCKED" &&
      data.allowFuelAccess
    ) {
      throw new OrganizationServiceError(
        "A blocked organization cannot be granted fuel access.",
        400,
      );
    }


    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    return organizationRepository.updateFuelAccess(
      id,
      data.allowFuelAccess,
    );
  },


  // ===================================================
  // UPDATE FUEL POLICY
  // ===================================================

  updateFuelPolicy: async (
    id: string,
    data: UpdateOrganizationFuelPolicyInput,
  ) => {

    const organization =
      await organizationRepository.findById(id);


    if (!organization) {
      throw new OrganizationServiceError(
        "Organization not found.",
        404,
      );
    }


    // -----------------------------------------------
    // VALIDATE POLICY
    // -----------------------------------------------

    if (
      data.maxTransactionLiters !==
        undefined &&
      data.maxTransactionLiters <= 0
    ) {
      throw new OrganizationServiceError(
        "Maximum transaction liters must be greater than zero.",
        400,
      );
    }


    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    return organizationRepository.updateFuelPolicy(
      id,
      data,
    );
  },


  // ===================================================
  // DELETE ORGANIZATION
  // ===================================================

  delete: async (
    id: string,
  ) => {

    const organization =
      await organizationRepository.findById(id);


    if (!organization) {
      throw new OrganizationServiceError(
        "Organization not found.",
        404,
      );
    }


    // -----------------------------------------------
    // PROTECT ORGANIZATIONS WITH HISTORY
    // -----------------------------------------------

    if (
      organization._count.fuelTransactions > 0
    ) {
      throw new OrganizationServiceError(
        "This organization cannot be deleted because it has fuel transaction history. Deactivate or block it instead.",
        409,
      );
    }


    // -----------------------------------------------
    // DELETE
    // -----------------------------------------------

    await organizationRepository.delete(id);

    return {
      message: "Organization deleted successfully.",
    };
  },
};