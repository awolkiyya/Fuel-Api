import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { ROLE_PERMISSIONS } from "../rules/role.permissions";
import { Role } from "../rules/roles";
import { Permission, PERMISSIONS } from "../rules/permissions";

export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role as Role | undefined;

    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const permissions = ROLE_PERMISSIONS[role] || [];

    const hasPermission =
      permissions.includes(PERMISSIONS.ALL) ||
      permissions.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};