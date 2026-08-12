import { FuelTransactionType, PaymentStatus, Prisma } from "@prisma/client";
import prisma from "../../config/db";
import { transactionRepository } from "./transactions.repository";
import { CreateOrganizationTransactionInput, createOrganizationTransactionSchema } from "./transactions.validation";

export const transactionService = {
  createTransaction: async (
    fuelRequestId: string,
    litersGiven: number
  ) => {

    // 1. Get fuel request
    const request = await prisma.fuelRequest.findUnique({
      where: { id: fuelRequestId },
      include: {
        station: {
          include: {
            settings: true,
          },
        },
      },
    });


    if (!request) {
      throw new Error("Fuel request not found");
    }


    // 2. Prevent duplicate transaction
    // Removed because FuelRequest has no transaction relation
    const existingTransaction =
      await prisma.transaction.findFirst({
        where: {
          fuelRequestId: request.id,
        },
      });


    if (existingTransaction) {
      throw new Error("Transaction already exists");
    }


    // 3. Must be approved first
    if (request.status !== "APPROVED") {
      throw new Error("Request not approved");
    }


    // 4. Validate liters
    if (litersGiven <= 0) {
      throw new Error("Invalid liters");
    }


    if (
      request.approvedLiters &&
      litersGiven > request.approvedLiters
    ) {
      throw new Error("Exceeds approved liters");
    }


    // 5. Get price
    // TODO:
    // Replace this with your FuelPrice table/service
    const pricePerLiter = 0;


    if (!pricePerLiter) {
      throw new Error(
        "Fuel price not configured"
      );
    }


    const totalCost =
      litersGiven * pricePerLiter;



    // 6. Create transaction
    const transaction =
      await transactionRepository.create({
        fuelRequestId: request.id,
        userId: request.userId,
        vehicleId: request.vehicleId,
        stationId: request.stationId,

        litersGiven,
        pricePerLiter,
        totalCost,

        paymentStatus: "UNPAID",
      });



    // 7. Update fuel request status
    await prisma.fuelRequest.update({
      where: {
        id: request.id,
      },
      data: {
        status: "COMPLETED",
      },
    });



    // 8. Update station traffic
    await prisma.stationTraffic.update({
      where: {
        stationId: request.stationId,
      },
      data: {
        queueCount: {
          decrement: 1,
        },
      },
    });



    return transaction;
  },


  getAllTransactions: async () => {
    return transactionRepository.findAll();
  },


  getTransactionById: async (
    id: string
  ) => {

    const tx =
      await transactionRepository.findById(id);


    if (!tx) {
      throw new Error(
        "Transaction not found"
      );
    }


    return tx;
  },
};


// orginazation related

class TransactionError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 400,
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createOrganizationTransactionService(
  payload: CreateOrganizationTransactionInput,
) {
  const data =
    createOrganizationTransactionSchema.parse(payload);

  const {
    organizationId,
    fuelTypeId,
    stationId,
    litersGiven,
    attendantId,
    nozzleId,
  } = data;

  if (!Number.isFinite(litersGiven) || litersGiven <= 0) {
    throw new TransactionError(
      "Fuel quantity must be greater than zero.",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      // =====================================================
      // 1. ORGANIZATION
      // =====================================================

      const organization =
        await tx.organization.findUnique({
          where: {
            id: organizationId,
          },
        });

      if (!organization) {
        throw new TransactionError(
          "Organization not found.",
          404,
        );
      }

      // =====================================================
      // 2. ORGANIZATION STATUS
      // =====================================================

      if (organization.status !== "ACTIVE") {
        throw new TransactionError(
          `Organization is ${organization.status.toLowerCase()} and cannot receive fuel.`,
        );
      }

      // =====================================================
      // 3. FUEL ACCESS
      // =====================================================

      if (!organization.allowFuelAccess) {
        throw new TransactionError(
          "Fuel access is disabled for this organization.",
        );
      }

      // =====================================================
      // 4. MAX TRANSACTION LIMIT
      // =====================================================

      const maxTransactionLiters =
        Number(organization.maxTransactionLiters);

      if (litersGiven > maxTransactionLiters) {
        throw new TransactionError(
          `Maximum fuel quantity per transaction is ${maxTransactionLiters} liters.`,
        );
      }

      // =====================================================
      // 5. FUEL TYPE
      // =====================================================

      const fuelType =
        await tx.fuelType.findUnique({
          where: {
            id: fuelTypeId,
          },
        });

      if (!fuelType) {
        throw new TransactionError(
          "Fuel type not found.",
          404,
        );
      }

      // =====================================================
      // 6. STATION
      // =====================================================

      const station =
        await tx.station.findUnique({
          where: {
            id: stationId,
          },
        });

      if (!station) {
        throw new TransactionError(
          "Station not found.",
          404,
        );
      }

      // =====================================================
      // 7. ATTENDANT
      // =====================================================

      if (attendantId) {
        const attendant =
          await tx.user.findUnique({
            where: {
              id: attendantId,
            },
          });

        if (!attendant) {
          throw new TransactionError(
            "Fuel attendant not found.",
            404,
          );
        }
      }

      // =====================================================
      // 8. NOZZLE
      // =====================================================

      if (nozzleId) {
        const nozzle =
          await tx.nozzle.findUnique({
            where: {
              id: nozzleId,
            },
          });

        if (!nozzle) {
          throw new TransactionError(
            "Nozzle not found.",
            404,
          );
        }
      }

      // =====================================================
      // 9. FIND ACTIVE QUOTA
      // =====================================================

      let quota = null;

      if (organization.requiresQuota) {
        const now = new Date();

        quota =
          await tx.fuelQuota.findFirst({
            where: {
              organizationId,
              fuelTypeId,
              status: "ACTIVE",

              startDate: {
                lte: now,
              },

              endDate: {
                gte: now,
              },
            },

            orderBy: {
              endDate: "asc",
            },
          });

        if (!quota) {
          throw new TransactionError(
            `No active quota exists for ${fuelType.name}.`,
          );
        }

        // ===================================================
        // 10. CHECK REMAINING QUOTA
        // ===================================================

        const allocated =
          Number(quota.allocatedLiters);

        const consumed =
          Number(quota.consumedLiters);

        const remaining =
          allocated - consumed;

        if (litersGiven > remaining) {
          throw new TransactionError(
            `Only ${remaining} liters remain in the organization's quota.`,
          );
        }
      }

      // =====================================================
      // 11. PRICE
      // =====================================================

      /*
       * IMPORTANT:
       *
       * Replace this with your actual station/fuel pricing
       * relation if your FuelType model does not contain
       * pricePerLiter.
       */

      const pricePerLiter =
        Number(
          (fuelType as any).pricePerLiter ??
          (fuelType as any).price ??
          0,
        );

      if (pricePerLiter <= 0) {
        throw new TransactionError(
          "Fuel price is not configured.",
        );
      }

      // =====================================================
      // 12. CALCULATE TOTAL
      // =====================================================

      const totalCost =
        litersGiven * pricePerLiter;

      // =====================================================
      // 13. CREATE TRANSACTION
      // =====================================================

      const transaction =
        await tx.transaction.create({
          data: {
            type: FuelTransactionType.ORGANIZATION,

            organizationId,

            stationId,

            fuelTypeId,

            attendantId:
              attendantId ?? null,

            nozzleId:
              nozzleId ?? null,

            litersGiven,

            pricePerLiter,

            totalCost,

            paymentStatus:
              PaymentStatus.UNPAID,

            fuelRequestId: null,

            userId: null,

            vehicleId: null,
          },

          include: {
            organization: true,
            fuelType: true,
            station: true,
            attendant: true,
            nozzle: true,
          },
        });

      // =====================================================
      // 14. UPDATE QUOTA
      // =====================================================

      if (quota) {
        await tx.fuelQuota.update({
          where: {
            id: quota.id,
          },

          data: {
            consumedLiters: {
              increment: litersGiven,
            },
          },
        });
      }

      // =====================================================
      // 15. RETURN RECEIPT
      // =====================================================

      return {
        transaction: {
          id: transaction.id,
          type: transaction.type,

          organization: {
            id: transaction.organization!.id,
            name: transaction.organization!.name,
            registrationNumber:
              transaction.organization!.registrationNumber,
          },

          fuel: {
            id: transaction.fuelType.id,
            name: transaction.fuelType.name,
          },

          station: {
            id: transaction.station.id,
          },

          litersGiven:
            Number(transaction.litersGiven),

          pricePerLiter:
            Number(transaction.pricePerLiter),

          totalCost:
            Number(transaction.totalCost),

          paymentStatus:
            transaction.paymentStatus,

          createdAt:
            transaction.createdAt,
        },

        quota: quota
          ? {
              id: quota.id,

              allocatedLiters:
                Number(quota.allocatedLiters),

              consumedLiters:
                Number(quota.consumedLiters) +
                litersGiven,

              remainingLiters:
                Number(quota.allocatedLiters) -
                (Number(quota.consumedLiters) +
                  litersGiven),

              periodType:
                quota.periodType,

              startDate:
                quota.startDate,

              endDate:
                quota.endDate,
            }
          : null,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}