import { quotaRepository } from "./quota.repository";

import type {
  CreateQuotaInput,
  UpdateQuotaInput,
  ApproveQuotaInput,
  CancelQuotaInput,
  GetActiveQuotaQuery,
  GetQuotasQuery,
} from "./quota.schema";

// =====================================================
// SERVICE ERROR
// =====================================================

export class QuotaServiceError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400,
  ) {
    super(message);

    this.name = "QuotaServiceError";

    this.statusCode = statusCode;
  }
}

// =====================================================
// TYPES
// =====================================================

type QuotaStatus =
  | "ACTIVE"
  | "EXHAUSTED"
  | "EXPIRED"
  | "CANCELLED";

// =====================================================
// HELPERS
// =====================================================

function getRemainingLiters(
  allocatedLiters: number,
  consumedLiters: number,
): number {
  return Math.max(
    0,
    allocatedLiters - consumedLiters,
  );
}

function getUtilizationPercentage(
  allocatedLiters: number,
  consumedLiters: number,
): number {
  if (allocatedLiters <= 0) {
    return 0;
  }

  return Number(
    (
      (consumedLiters /
        allocatedLiters) *
      100
    ).toFixed(2),
  );
}

function mapQuota(quota: any) {
  const allocatedLiters = Number(
    quota.allocatedLiters,
  );

  const consumedLiters = Number(
    quota.consumedLiters,
  );

  const remainingLiters =
    getRemainingLiters(
      allocatedLiters,
      consumedLiters,
    );

  return {
    ...quota,

    allocatedLiters,

    consumedLiters,

    remainingLiters,

    utilizationPercentage:
      getUtilizationPercentage(
        allocatedLiters,
        consumedLiters,
      ),
  };
}

// =====================================================
// QUOTA SERVICE
// =====================================================

export const quotaService = {
  // ===================================================
  // CREATE QUOTA
  // ===================================================

  create: async (
    data: CreateQuotaInput,
  ) => {
    // -------------------------------------------------
    // ORGANIZATION
    // -------------------------------------------------

    const organization =
      await quotaRepository.findOrganization(
        data.organizationId,
      );

    if (!organization) {
      throw new QuotaServiceError(
        "Organization not found.",
        404,
      );
    }

    // -------------------------------------------------
    // ORGANIZATION STATUS
    // -------------------------------------------------

    if (
      organization.status !==
      "ACTIVE"
    ) {
      throw new QuotaServiceError(
        "Quota cannot be assigned to an inactive organization.",
        400,
      );
    }

    // -------------------------------------------------
    // FUEL ACCESS
    // -------------------------------------------------

    if (
      !organization.allowFuelAccess
    ) {
      throw new QuotaServiceError(
        "Fuel access is disabled for this organization.",
        403,
      );
    }

    // -------------------------------------------------
    // QUOTA POLICY
    // -------------------------------------------------

    if (
      !organization.requiresQuota
    ) {
      throw new QuotaServiceError(
        "This organization is not configured for quota-based fueling.",
        400,
      );
    }

    // -------------------------------------------------
    // FUEL TYPE
    // -------------------------------------------------

    const fuelType =
      await quotaRepository.findFuelType(
        data.fuelTypeId,
      );

    if (!fuelType) {
      throw new QuotaServiceError(
        "Fuel type not found.",
        404,
      );
    }

    // -------------------------------------------------
    // DATE VALIDATION
    // -------------------------------------------------

    if (
      data.endDate <=
      data.startDate
    ) {
      throw new QuotaServiceError(
        "Quota end date must be later than start date.",
        400,
      );
    }

    // -------------------------------------------------
    // ALLOCATION VALIDATION
    // -------------------------------------------------

    if (
      data.allocatedLiters <= 0
    ) {
      throw new QuotaServiceError(
        "Allocated liters must be greater than zero.",
        400,
      );
    }

    // -------------------------------------------------
    // OVERLAPPING QUOTA
    // -------------------------------------------------

    const overlapping =
      await quotaRepository.findOverlapping(
        {
          organizationId:
            data.organizationId,

          fuelTypeId:
            data.fuelTypeId,

          startDate:
            data.startDate,

          endDate:
            data.endDate,
        },
      );

    if (
      overlapping.length > 0
    ) {
      throw new QuotaServiceError(
        "An overlapping quota already exists for this organization and fuel type.",
        409,
      );
    }

    // -------------------------------------------------
    // CREATE
    // -------------------------------------------------

    const quota =
      await quotaRepository.create(
        data,
      );

    return mapQuota(quota);
  },

  // ===================================================
  // GET ALL QUOTAS
  // ===================================================

  getAll: async (
    query: GetQuotasQuery,
  ) => {
    const {
      page,
      limit,
      organizationId,
      fuelTypeId,
      periodType,
      status,
      startDate,
      endDate,
    } = query;

    // -------------------------------------------------
    // PAGINATION
    // -------------------------------------------------

    const skip =
      (page - 1) * limit;

    // -------------------------------------------------
    // WHERE
    // -------------------------------------------------

    const where: Record<
      string,
      any
    > = {};

    if (organizationId) {
      where.organizationId =
        organizationId;
    }

    if (fuelTypeId) {
      where.fuelTypeId =
        fuelTypeId;
    }

    if (periodType) {
      where.periodType =
        periodType;
    }

    if (status) {
      where.status =
        status;
    }

    // -------------------------------------------------
    // DATE RANGE FILTER
    // -------------------------------------------------
    //
    // Returns quotas that overlap the
    // requested date range.
    //
    // Existing start <= requested end
    // AND
    // Existing end >= requested start
    //
    // -------------------------------------------------

    const dateConditions: any[] =
      [];

    if (startDate) {
      dateConditions.push({
        endDate: {
          gte: startDate,
        },
      });
    }

    if (endDate) {
      dateConditions.push({
        startDate: {
          lte: endDate,
        },
      });
    }

    if (
      dateConditions.length > 0
    ) {
      where.AND =
        dateConditions;
    }

    // -------------------------------------------------
    // DATABASE
    // -------------------------------------------------

    const [
      quotas,
      total,
    ] = await Promise.all([
      quotaRepository.findMany({
        where,
        skip,
        limit,
      }),

      quotaRepository.count(
        where,
      ),
    ]);

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    const data = quotas.map(
      mapQuota,
    );

    const totalPages =
      Math.ceil(
        total / limit,
      );

    return {
      data,

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
  // GET QUOTA BY ID
  // ===================================================

  getById: async (
    id: string,
  ) => {
    const quota =
      await quotaRepository.findById(
        id,
      );

    if (!quota) {
      throw new QuotaServiceError(
        "Quota not found.",
        404,
      );
    }

    return mapQuota(quota);
  },

  // ===================================================
  // UPDATE QUOTA
  // ===================================================

  update: async (
    id: string,
    data: UpdateQuotaInput,
  ) => {
    // -------------------------------------------------
    // FIND EXISTING QUOTA
    // -------------------------------------------------

    const quota =
      await quotaRepository.findById(
        id,
      );

    if (!quota) {
      throw new QuotaServiceError(
        "Quota not found.",
        404,
      );
    }

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (
      quota.status !==
      "ACTIVE"
    ) {
      throw new QuotaServiceError(
        "Only active quotas can be updated.",
        400,
      );
    }

    // -------------------------------------------------
    // CONSUMPTION PROTECTION
    // -------------------------------------------------

    const currentConsumed =
      Number(
        quota.consumedLiters,
      );

    if (
      data.allocatedLiters !==
        undefined &&
      data.allocatedLiters <
        currentConsumed
    ) {
      throw new QuotaServiceError(
        `Allocated liters cannot be lower than already consumed liters (${currentConsumed}).`,
        400,
      );
    }

    // -------------------------------------------------
    // FINAL VALUES
    // -------------------------------------------------

    const finalFuelTypeId =
      data.fuelTypeId ??
      quota.fuelTypeId;

    const finalStartDate =
      data.startDate ??
      quota.startDate;

    const finalEndDate =
      data.endDate ??
      quota.endDate;

    // -------------------------------------------------
    // DATE VALIDATION
    // -------------------------------------------------

    if (
      finalEndDate <=
      finalStartDate
    ) {
      throw new QuotaServiceError(
        "Quota end date must be later than start date.",
        400,
      );
    }

    // -------------------------------------------------
    // FUEL TYPE VALIDATION
    // -------------------------------------------------

    if (
      data.fuelTypeId !==
      undefined
    ) {
      const fuelType =
        await quotaRepository.findFuelType(
          data.fuelTypeId,
        );

      if (!fuelType) {
        throw new QuotaServiceError(
          "Fuel type not found.",
          404,
        );
      }
    }

    // -------------------------------------------------
    // OVERLAP VALIDATION
    // -------------------------------------------------

    const overlapping =
      await quotaRepository.findOverlapping(
        {
          organizationId:
            quota.organizationId,

          fuelTypeId:
            finalFuelTypeId,

          startDate:
            finalStartDate,

          endDate:
            finalEndDate,

          excludeId: id,
        },
      );

    if (
      overlapping.length > 0
    ) {
      throw new QuotaServiceError(
        "The updated quota period overlaps another quota.",
        409,
      );
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const updated =
      await quotaRepository.update(
        id,
        data,
      );

    return mapQuota(updated);
  },

  // ===================================================
  // APPROVE QUOTA
  // ===================================================
  //
  // NOTE:
  // Your current Prisma model has no separate
  // approval status. ACTIVE is therefore treated
  // as the usable quota state.
  //
  // This method records the approving user in
  // assignedByUserId and optionally appends remarks.
  //
  // ===================================================

  approve: async (
    id: string,
    data: ApproveQuotaInput,
  ) => {
    const quota =
      await quotaRepository.findById(
        id,
      );

    if (!quota) {
      throw new QuotaServiceError(
        "Quota not found.",
        404,
      );
    }

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (
      quota.status !==
      "ACTIVE"
    ) {
      throw new QuotaServiceError(
        "Only active quotas can be approved.",
        400,
      );
    }

    // -------------------------------------------------
    // ORGANIZATION
    // -------------------------------------------------

    if (
      quota.organization.status !==
      "ACTIVE"
    ) {
      throw new QuotaServiceError(
        "The organization is not active.",
        400,
      );
    }

    if (
      !quota.organization
        .allowFuelAccess
    ) {
      throw new QuotaServiceError(
        "Fuel access is disabled for this organization.",
        403,
      );
    }

    if (
      !quota.organization
        .requiresQuota
    ) {
      throw new QuotaServiceError(
        "Quota-based fueling is disabled for this organization.",
        400,
      );
    }

    // -------------------------------------------------
    // UPDATE ASSIGNMENT / APPROVAL
    // -------------------------------------------------

    const remarks =
      data.remarks?.trim();

    const updated =
      await prismaSafeUpdateQuota(
        id,
        data.approvedByUserId,
        remarks,
      );

    return mapQuota(updated);
  },

  // ===================================================
  // CANCEL QUOTA
  // ===================================================

  cancel: async (
    id: string,
    data: CancelQuotaInput,
  ) => {
    const quota =
      await quotaRepository.findById(
        id,
      );

    if (!quota) {
      throw new QuotaServiceError(
        "Quota not found.",
        404,
      );
    }

    // -------------------------------------------------
    // ALREADY CANCELLED
    // -------------------------------------------------

    if (
      quota.status ===
      "CANCELLED"
    ) {
      throw new QuotaServiceError(
        "Quota is already cancelled.",
        400,
      );
    }

    // -------------------------------------------------
    // EXHAUSTED
    // -------------------------------------------------

    if (
      quota.status ===
      "EXHAUSTED"
    ) {
      throw new QuotaServiceError(
        "An exhausted quota cannot be cancelled.",
        400,
      );
    }

    // -------------------------------------------------
    // EXPIRED
    // -------------------------------------------------

    if (
      quota.status ===
      "EXPIRED"
    ) {
      throw new QuotaServiceError(
        "An expired quota cannot be cancelled.",
        400,
      );
    }

    // -------------------------------------------------
    // CONSUMPTION PROTECTION
    // -------------------------------------------------

    const consumed =
      Number(
        quota.consumedLiters,
      );

    if (consumed > 0) {
      throw new QuotaServiceError(
        "A quota with fuel consumption cannot be cancelled.",
        409,
      );
    }

    // -------------------------------------------------
    // STORE REASON
    // -------------------------------------------------

    const remarks =
      `Cancelled: ${data.reason.trim()}`;

    await quotaRepository.update(
      id,
      {
        remarks,
      },
    );

    // -------------------------------------------------
    // CHANGE STATUS
    // -------------------------------------------------

    const cancelled =
      await quotaRepository.updateStatus(
        id,
        "CANCELLED",
      );

    return mapQuota(cancelled);
  },

  // ===================================================
  // GET ACTIVE QUOTA
  // ===================================================

  getActiveQuota: async ({
    organizationId,
    fuelTypeId,
    date,
  }: GetActiveQuotaQuery) => {
    // -------------------------------------------------
    // ORGANIZATION
    // -------------------------------------------------

    const organization =
      await quotaRepository.findOrganization(
        organizationId,
      );

    if (!organization) {
      throw new QuotaServiceError(
        "Organization not found.",
        404,
      );
    }

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (
      organization.status !==
      "ACTIVE"
    ) {
      throw new QuotaServiceError(
        "Organization is not active.",
        400,
      );
    }

    // -------------------------------------------------
    // FUEL ACCESS
    // -------------------------------------------------

    if (
      !organization.allowFuelAccess
    ) {
      throw new QuotaServiceError(
        "Fuel access is disabled.",
        403,
      );
    }

    // -------------------------------------------------
    // QUOTA POLICY
    // -------------------------------------------------

    if (
      !organization.requiresQuota
    ) {
      throw new QuotaServiceError(
        "Quota-based fueling is disabled for this organization.",
        400,
      );
    }

    // -------------------------------------------------
    // FUEL TYPE
    // -------------------------------------------------

    const fuelType =
      await quotaRepository.findFuelType(
        fuelTypeId,
      );

    if (!fuelType) {
      throw new QuotaServiceError(
        "Fuel type not found.",
        404,
      );
    }

    // -------------------------------------------------
    // FIND ACTIVE QUOTA
    // -------------------------------------------------

    const quota =
      await quotaRepository.findActiveQuota(
        {
          organizationId,

          fuelTypeId,

          date:
            date ??
            new Date(),
        },
      );

    if (!quota) {
      throw new QuotaServiceError(
        "No active quota found for this organization and fuel type.",
        404,
      );
    }

    // -------------------------------------------------
    // CONSUMPTION
    // -------------------------------------------------

    const allocated =
      Number(
        quota.allocatedLiters,
      );

    const consumed =
      Number(
        quota.consumedLiters,
      );

    const remaining =
      getRemainingLiters(
        allocated,
        consumed,
      );

    // -------------------------------------------------
    // EXHAUSTED
    // -------------------------------------------------

    if (
      remaining <= 0
    ) {
      await quotaRepository
        .updateStatus(
          quota.id,
          "EXHAUSTED",
        );

      throw new QuotaServiceError(
        "Quota has been exhausted.",
        409,
      );
    }

    return mapQuota(quota);
  },

  // ===================================================
  // REFRESH QUOTA STATUS
  // ===================================================

  refreshStatus: async (
    id: string,
  ) => {
    const quota =
      await quotaRepository.findById(
        id,
      );

    if (!quota) {
      throw new QuotaServiceError(
        "Quota not found.",
        404,
      );
    }

    // -------------------------------------------------
    // CANCELLED IS FINAL
    // -------------------------------------------------

    if (
      quota.status ===
      "CANCELLED"
    ) {
      return mapQuota(quota);
    }

    const now =
      new Date();

    // -------------------------------------------------
    // EXPIRED
    // -------------------------------------------------

    if (
      quota.endDate < now
    ) {
      const updated =
        await quotaRepository
          .updateStatus(
            id,
            "EXPIRED",
          );

      return mapQuota(updated);
    }

    // -------------------------------------------------
    // EXHAUSTED
    // -------------------------------------------------

    const allocated =
      Number(
        quota.allocatedLiters,
      );

    const consumed =
      Number(
        quota.consumedLiters,
      );

    if (
      consumed >= allocated
    ) {
      const updated =
        await quotaRepository
          .updateStatus(
            id,
            "EXHAUSTED",
          );

      return mapQuota(updated);
    }

    // -------------------------------------------------
    // ACTIVE
    // -------------------------------------------------

    if (
      quota.status !==
      "ACTIVE"
    ) {
      const updated =
        await quotaRepository
          .updateStatus(
            id,
            "ACTIVE",
          );

      return mapQuota(updated);
    }

    return mapQuota(quota);
  },
};

// =====================================================
// APPROVAL UPDATE HELPER
// =====================================================
//
// The current FuelQuota schema contains:
//
// assignedByUserId
// approvedAt
// remarks
//
// The repository update() intentionally does not expose
// approvedAt/assignedByUserId because normal quota edits
// should not modify approval metadata.
//
// Therefore approval uses Prisma directly here.
//
// =====================================================

async function prismaSafeUpdateQuota(
  id: string,
  approvedByUserId: string,
  remarks?: string,
) {
  const data: Record<
    string,
    unknown
  > = {
    assignedByUserId:
      approvedByUserId,

    approvedAt:
      new Date(),
  };

  if (
    remarks !==
    undefined
  ) {
    data.remarks =
      remarks || null;
  }

  return quotaRepositoryUpdateApproval(
    id,
    data,
  );
}

// =====================================================
// APPROVAL REPOSITORY BRIDGE
// =====================================================
//
// Kept isolated so the normal repository update()
// cannot accidentally change approval metadata.
//
// =====================================================

async function quotaRepositoryUpdateApproval(
  id: string,
  data: Record<
    string,
    unknown
  >,
) {
  return prismaImport().fuelQuota.update(
    {
      where: {
        id,
      },

      data,

      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            allowFuelAccess: true,
            quotaEnabled: true,
            maxTransactionLiters: true,
          },
        },

        fuelType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  );
}

// =====================================================
// PRISMA ACCESS
// =====================================================
//
// Dynamic import keeps this service independent from
// the repository's normal CRUD methods while approval
// metadata remains isolated.
//
// =====================================================

function prismaImport() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../../../config/db").default;
}
