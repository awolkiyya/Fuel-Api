import { Router } from "express";
import {
  createOrganizationTransaction,
  createTransaction,
  getTransactions,
} from "./transactions.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

import { createTransactionSchema } from "../../schemas/transactions.schema";

const router = Router();


// normal user related

router.post(
  "/",
  authMiddleware,
  validate(createTransactionSchema),
  createTransaction
);

router.get("/", authMiddleware, getTransactions);



// orginization related 
// =====================================================
// ORGANIZATION FUEL TRANSACTIONS
// =====================================================

// POST /api/transactions/organization
// Dispense fuel to an organization.
router.post(
  "/organization",
  createOrganizationTransaction,
);

// // GET /api/transactions/organization/:organizationId
// // Get transactions belonging to an organization.
// router.get(
//   "/organization/:organizationId",
//   getOrganizationTransactions,
// );

// // GET /api/transactions/organization/:organizationId/:transactionId
// // Get one organization transaction.
// router.get(
//   "/organization/:organizationId/:transactionId",
//   getOrganizationTransactionById,
// );

export default router;