import prisma from "../../config/db";
import { transactionRepository } from "./transactions.repository";

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