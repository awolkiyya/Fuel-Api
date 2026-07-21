import { Response } from "express";
import { ApiResponse, Meta } from "../types/apiResponse";

export const sendResponse = <T>(
  res: Response,
  {
    success = true,
    message = "OK",
    data = null,
    meta,
    statusCode = 200,
  }: {
    success?: boolean;
    message?: string;
    data?: T | null;
    meta?: Meta;
    statusCode?: number;
  }
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};