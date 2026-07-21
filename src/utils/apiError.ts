import { Response } from "express";

export const sendError = (
  res: Response,
  {
    message = "Something went wrong",
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details = null,
  }: {
    message?: string;
    statusCode?: number;
    code?: string;
    details?: any;
  }
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
  });
};