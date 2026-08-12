import { Request, Response } from "express";
import { createOrganizationTransactionService, transactionService } from "./transactions.service";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { fuelRequestId, litersGiven } = req.body;

    const tx = await transactionService.createTransaction(
      fuelRequestId,
      litersGiven
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created",
      data: tx,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const data = await transactionService.getAllTransactions();

    return res.json({
      success: true,
      message: "Transactions fetched",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// orginization related
export async function createOrganizationTransaction(
  req: Request,
  res: Response,
) {
  try {
    const result =
      await createOrganizationTransactionService(req.body);

    return res.status(201).json({
      success: true,
      message: "Organization fuel transaction completed successfully.",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Create organization transaction error:",
      error,
    );

    return res.status(error.statusCode ?? 500).json({
      success: false,
      message:
        error.message ??
        "Failed to create organization fuel transaction.",
    });
  }
}