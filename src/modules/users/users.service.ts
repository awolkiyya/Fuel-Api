import bcrypt from "bcrypt";
import { userRepository } from "./users.repository";
import { CreateUserDTO, UpdateUserDTO } from "./users.types";
import { buildMeta } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";

export const userService = {
  getAllUsers: async ({
    page,
    limit,
    skip,
    search,
    status,
    currentUserId,
  }: any) => {
    const [users, total] = await Promise.all([
      userRepository.findAll({
        skip,
        limit,
        search,
        status,
        excludeUserId: currentUserId,
      }),
      userRepository.count({
        search,
        status,
        excludeUserId: currentUserId,
      }),
    ]);

    return {
      data: users,
      meta: buildMeta(page, limit, total),
    };
  },

  getUserById: async (id: string) => {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
  },

  createUser: async (data: CreateUserDTO) => {
    const existing = await userRepository.findByPhone(data.phone);

    if (existing) {
      throw new AppError("Phone already exists", 409, "PHONE_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role || "driver",
    });
  },

  updateUser: async (id: string, data: UpdateUserDTO) => {
    if (!Object.keys(data).length) {
      throw new AppError("No update data provided", 400, "EMPTY_UPDATE");
    }

    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return userRepository.update(id, data);
  },

  deleteUser: async (id: string) => {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return userRepository.delete(id);
  },
};