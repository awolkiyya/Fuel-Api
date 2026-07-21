import { Request, Response } from "express";
import { onboardingService } from "./onboarding.service";
import { sendResponse } from "../../utils/apiResponse";
import { sendError } from "../../utils/apiError";

// =========================
// GET MY PROFILE
// =========================
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    const user = await onboardingService.getMyProfile(userId);

    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: "Profile not found",
        code: "PROFILE_NOT_FOUND",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      message: "Profile fetched successfully",
      data: user,
    });

  } catch (error: any) {
    return sendError(res, {
      statusCode: 500,
      message: error.message || "Failed to get profile",
      code: "GET_PROFILE_FAILED",
    });
  }
};

// =========================
// UPDATE PROFILE (ONBOARDING)
// =========================
export const updateProfile = async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      console.log("i'm here");
  
      if (!userId) {
        return sendError(res, {
          statusCode: 401,
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }
  
      console.log("UPDATE PROFILE BODY:", req.body); // 👈 IMPORTANT DEBUG
  
      const updated = await onboardingService.updateProfile(
        userId,
        req.body
      );
  
      return sendResponse(res, {
        statusCode: 200,
        message: "Profile updated successfully",
        data: updated,
      });
  
    } catch (error: any) {
      console.error("UPDATE PROFILE ERROR:", error); // 👈 IMPORTANT
  
      return sendError(res, {
        statusCode: 500,
        message: error.message || "Failed to update profile",
        code: "UPDATE_PROFILE_FAILED",
      });
    }
  };