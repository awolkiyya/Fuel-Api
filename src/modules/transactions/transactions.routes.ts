import { Router } from "express";
import {
  createTransaction,
  getTransactions,
} from "./transactions.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

import { createTransactionSchema } from "../../schemas/transactions.schema";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createTransactionSchema),
  createTransaction
);

router.get("/", authMiddleware, getTransactions);

export default router;