import prisma from "../config/db";
import bcrypt from "bcrypt";
import { ROLES } from "../rules/roles";

const DEFAULT_PASSWORD = "123456";

export const seedUsers = async () => {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { phone: "0900000000" },
    update: {},
    create: {
      full_name: "Admin User",
      phone: "0900000000",
      email: "admin@test.com",
      password,
      role: ROLES.ADMIN,
    },
  });

  const driver = await prisma.user.upsert({
    where: { phone: "0911111111" },
    update: {},
    create: {
      full_name: "Driver User",
      phone: "0911111111",
      password,
      role: ROLES.DRIVER,
    },
  });

  return { admin, driver };
};