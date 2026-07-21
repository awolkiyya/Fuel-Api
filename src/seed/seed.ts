import {
  PrismaClient,
  UserRole,
  UserStatus,
  Gender,
} from "@prisma/client";
import bcrypt from "bcrypt";

import { seedVehicles } from "./vehicles.seed";
import { seedRejectionReasons } from "./rejectionReason.seed";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@system.com";
  const adminPhone = "0900000000";

  console.log("🌱 Seeding started...");

  // =====================================================
  // ADMIN
  // =====================================================

  let admin = await prisma.user.findFirst({
    where: {
      role: UserRole.admin,
    },
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash("Admin@12345", 10);

    admin = await prisma.user.create({
      data: {
        full_name: "System Admin",
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: UserRole.admin,
        status: UserStatus.ACTIVE,
        gender: Gender.MALE,
        profile_image: null,
      },
    });

    console.log("✅ Admin created");
  } else {
    console.log("ℹ️ Admin already exists");
  }

  // =====================================================
  // MASTER DATA
  // =====================================================

  await seedRejectionReasons();

  // =====================================================
  // SAMPLE DATA (OPTIONAL)
  // =====================================================

  // await seedVehicles(admin.id);

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });