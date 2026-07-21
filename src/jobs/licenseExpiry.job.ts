import cron from "node-cron";
import prisma from "../config/db";

export function startLicenseExpiryJob() {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running license expiry check...");

    const now = new Date();

    await prisma.businessLicense.updateMany({
      where: {
        expiryDate: {
          lt: now,
        },
        status: {
          not: "EXPIRED",
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log("License expiry update completed");
  });
}