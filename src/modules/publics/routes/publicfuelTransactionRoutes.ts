// =====================================================
// DRIVER FUEL TRANSACTION ROUTES
// =====================================================

import { Router } from "express";

import { authMiddleware } from "../../../middlewares/auth.middleware";
import { riskMiddleware } from "../../../middlewares/risk.middleware";
import { getMyFuelTransactions } from "../controllers/fuelTransaction.controller";


const router = Router();

/* =====================================================
   DRIVER FUEL TRANSACTIONS
===================================================== */

/**
 * =====================================================
 * GET MY FUEL TRANSACTIONS
 * GET /api/public/fueltransactions/my
 * =====================================================
 */
router.get(
  "/my",
  authMiddleware,
  riskMiddleware,
  getMyFuelTransactions,
);

/**
 * =====================================================
 * GET FUEL TRANSACTION DETAILS
 * GET /api/public/fueltransactions/:id
 * =====================================================
 */
router.get(
  "/:id",
  authMiddleware,
  riskMiddleware,
  getMyFuelTransactions,
);

export default router;