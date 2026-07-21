import { Request, Response } from "express";
import { userService } from "./users.service";
import { sendResponse } from "../../utils/apiResponse";
import { sendError } from "../../utils/apiError";
import { getPagination } from "../../utils/pagination";
import { userResource } from "./user.resource";

type IdParams = {
  id: string;
};

// GET ALL USERS
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query)

    const search = (req.query.search as string) || ""
    const role = (req.query.role as string) || ""
    const status = (req.query.status as string) || ""

    /* 👇 GET CURRENT USER ID FROM AUTH MIDDLEWARE */
    const currentUserId = (req as any).user?.id

    const result = await userService.getAllUsers({
      page,
      limit,
      skip,
      search,
      status,
      currentUserId,
    })

    return sendResponse(res, {
      message: "Users fetched successfully",
      data: result.data.map(userResource),
      meta: result.meta,
    })
  } catch (err: any) {
    return sendError(res, {
      message: err.message,
    })
  }
}

// GET USER BY ID
export const getUserById = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return sendResponse(res, {
      message: "User fetched successfully",
      data: user,
    });
  } catch (err: any) {
    return sendError(res, {
      message: err.message || "User not found",
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
};

// CREATE USER
export const createUser = async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);

    return sendResponse(res, {
      message: "User created successfully",
      data: user,
      statusCode: 201,
    });
};

  // UPDATE USER
  export const updateUser = async (
    req: Request,
    res: Response
  ) => {
    // ================= VEHICLE ID =================
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

      const user = await userService.updateUser(id, req.body)

      return sendResponse(res, {
        message: "User updated successfully",
        data: user,
      })
  }

// DELETE USER
export const deleteUser = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    await userService.deleteUser(req.params.id);

    return sendResponse(res, {
      message: "User deleted successfully",
    });
  } catch (err: any) {
    return sendError(res, {
      message: err.message || "Failed to delete user",
      statusCode: 400,
      code: "DELETE_FAILED",
    });
  }
};