import prisma from "../../config/db";
import { CreateUserDTO, UpdateUserDTO } from "./users.types";
import { Prisma, UserRole, UserStatus } from "@prisma/client";

/* =============================
   WHERE BUILDER (TYPE SAFE)
============================= */
const buildUserWhere = ({
  search,
  status,
  excludeUserId,
}: {
  search?: string;
  status?: UserStatus;
  excludeUserId?: string;
}): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {};

  where.role = {
    not: UserRole.driver,
  };

  if (excludeUserId) {
    where.id = {
      not: excludeUserId,
    };
  }

  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  return where;
};

/* =============================
   REPOSITORY
============================= */
export const userRepository = {
  /* -----------------------------
     FIND ALL USERS
  ------------------------------ */
  findAll: async ({
    skip,
    limit,
    search,
    status,
    excludeUserId,
  }: {
    skip: number;
    limit: number;
    search?: string;
    status?: UserStatus;
    excludeUserId?: string;
  }) => {
    const where = buildUserWhere({
      search,
      status,
      excludeUserId,
    });

    return prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        profile_image: true,
        gender: true,
        role: true,
        status: true,
        createdAt: true,
        managedStation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  /* -----------------------------
     COUNT (PAGINATION)
  ------------------------------ */
  count: async ({
    search,
    status,
    excludeUserId,
  }: {
    search?: string;
    status?: UserStatus;
    excludeUserId?: string;
  }) => {
    const where = buildUserWhere({
      search,
      status,
      excludeUserId,
    });

    return prisma.user.count({ where });
  },

  /* -----------------------------
     FIND BY ID
  ------------------------------ */
  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  /* -----------------------------
     FIND BY PHONE
  ------------------------------ */
  findByPhone: async (phone: string) => {
    return prisma.user.findUnique({
      where: { phone },
    });
  },

  /* -----------------------------
     CREATE USER
  ------------------------------ */
  create: async (data: CreateUserDTO) => {
    return prisma.user.create({
      data: {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        password: data.password,
  
        role: data.role ?? UserRole.driver,
        gender: data.gender ?? "MALE", // ✅ IMPORTANT FIX
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        gender: true,
        status: true,
        createdAt: true,
      },
    })
  },

  /* -----------------------------
     UPDATE USER (SAFE)
  ------------------------------ */
  update: async (id: string, data: UpdateUserDTO) => {
    const updateData: Prisma.UserUpdateInput = {}
  
    if (data.full_name !== undefined) {
      updateData.full_name = data.full_name
    }
  
    if (data.phone !== undefined) {
      updateData.phone = data.phone
    }
  
    if (data.email !== undefined) {
      updateData.email = data.email
    }
  
    if (data.role !== undefined) {
      updateData.role = data.role as UserRole
    }
  
    if (data.status !== undefined) {
      updateData.status = data.status
    }
  
    if (data.gender !== undefined) {
      updateData.gender = data.gender
    }
  
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        role: true,
        gender: true,   // ✅ important
        status: true,   // ✅ important
        createdAt: true,
      },
    })
  },
  /* -----------------------------
     DELETE USER
  ------------------------------ */
  delete: async (id: string) => {
    return prisma.user.delete({
      where: { id },
    });
  },
};