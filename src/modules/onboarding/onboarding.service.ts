import prisma from "../../config/db";
import { UpdateProfileDTO } from "./onboarding.type";
import { ROLE_PERMISSIONS } from "../../rules/role.permissions";
import { UserStatus } from "@prisma/client";

import { Role } from "../../rules/roles";

const mapUserResponse = (user: any) => {
  const role = user.role as Role; // ✅ FIX

  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    email: user.email,
    profile_image: user.profile_image,
    role,
    status: user.status,
    permissions,
    driverProfile: user.driverProfile ?? null,
    createdAt: user.createdAt,
  };
};
export const onboardingService = {
  // =========================
  // GET PROFILE
  // =========================
  getMyProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return mapUserResponse(user);
  },

  updateProfile: async (userId: string, data: UpdateProfileDTO) => {
    // =========================
    // 1. CHECK USER
    // =========================
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driverProfile: true },
    });
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // =========================
    // 2. SANITIZE INPUT
    // =========================
    const fullName = data.full_name?.trim();
    const nationalId = data.national_id?.trim();
    const licenseNumber = data.license_number?.trim();
    const email = data.email?.trim() || null;
    const phone = data.phone?.trim();
    const age = Number(data.age);
    const gender = data.gender;
  
    // =========================
    // 3. VALIDATION (SAFE CHECKS)
    // =========================
    if (!fullName || !phone || !nationalId || !licenseNumber) {
      throw new Error("Missing required fields");
    }
  
    if (!age || Number.isNaN(age) || age < 18) {
      throw new Error("Invalid age");
    }
  
    // =========================
    // 4. TRANSACTION
    // =========================
    const result = await prisma.$transaction(async (tx) => {
      // 🔹 Update USER
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          full_name: fullName,
          email: email ?? undefined,
          phone,
          status: UserStatus.ACTIVE,
          gender,

        },
      });
      
  
      // 🔹 Upsert DRIVER PROFILE
      const driverProfile = await tx.driverProfile.upsert({
        where: { userId },
        update: {
          age,
          nationalId,
          licenseNumber,
          isVerified: false, // reset verification if profile changes
        },
        create: {
          userId,
          age,
          nationalId,
          licenseNumber,
          isVerified: false,
        },
      });
  
      return {
        ...updatedUser,
        driverProfile,
      };
    });
  
    // =========================
    // 5. RESPONSE
    // =========================
    return mapUserResponse(result);
  },
};