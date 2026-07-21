import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./users.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

// schemas (you will create these)
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from "../../schemas/users.schema";

import { requirePermission } from "../../middlewares/permission.middleware";

const router = Router();


// 👤 GET ALL USERS (admin only)
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


// ➕ CREATE USER (admin only)
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


// ❌ DELETE USER
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("manage_users"),
  validate(idParamSchema, "params"),
  deleteUser
);

export default router;