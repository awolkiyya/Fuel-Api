import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => logger.info("Database connected successfully"))
  .catch((err) => logger.error(`DB connection failed: ${err.message}`));

export default prisma;