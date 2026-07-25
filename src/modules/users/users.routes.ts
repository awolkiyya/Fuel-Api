import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword, // 👈 add this
} from "./users.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { requirePermission } from "../../middlewares/permission.middleware";

import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  resetUserPasswordSchema, // 👈 add this
} from "../../schemas/users.schema";

const router = Router();

// =====================================================
// USERS
// =====================================================

// 👤 GET ALL USERS
router.get(
  "/",
  authMiddleware,
  requirePermission("manage_users"),
  getUsers
);

// 👤 GET USER BY ID
router.get(
  "/:id",
  authMiddleware,
  requirePermission("manage_users"),
  validate(idParamSchema, "params"),
  getUserById
);

// ➕ CREATE USER
router.post(
  "/",
  authMiddleware,
  requirePermission("manage_users"),
  validate(createUserSchema),
  createUser
);

// ✏️ UPDATE USER
router.put(
  "/:id",
  authMiddleware,
  requirePermission("manage_users"),
  validate(idParamSchema, "params"),
  validate(updateUserSchema),
  updateUser
);

// 🔑 RESET USER PASSWORD (Admin)
router.patch(
  "/:id/reset-password",
  authMiddleware,
  requirePermission("manage_users"),
  validate(idParamSchema, "params"),
  validate(resetUserPasswordSchema),
  resetUserPassword
);

// ❌ DELETE USER
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("manage_users"),
  validate(idParamSchema, "params"),
  deleteUser
);

export default router;