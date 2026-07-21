import { Gender, UserRole, UserStatus } from "@prisma/client";

export type CreateUserDTO = {
  full_name: string
  phone: string
  email?: string
  password: string
  role?: UserRole
  gender?: Gender
}

export type UpdateUserDTO = {
  full_name?: string
  phone?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  gender?: Gender
}

export type UserResponse = {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
};