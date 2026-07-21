import { Request, Response } from "express";
import { transactionService } from "./transactions.service";

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