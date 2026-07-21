import { Request, Response } from "express";
import { fuelRequestService } from "./fuelRequests.service";

type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

// CREATE
export const createFuelRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // const userId = req.user?.id!;

    // const request = await fuelRequestService.createRequest(
    //   userId,
    //   req.body
    // );

    // return res.status(201).json({
    //   success: true,
    //   message: "Fuel request created",
    //   data: request,
    // });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// APPROVE
export const approveFuelRequest = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { approvedLiters } = req.body;

    const result = await fuelRequestService.approveRequest(
      id,
      approvedLiters
    );

    return res.json({
      success: true,
      message: "Request approved",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL
export const getFuelRequests = async (_req: Request, res: Response) => {
  try {
    const data = await fuelRequestService.getAllRequests();

    return res.json({
      success: true,
      message: "Requests fetched",
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};