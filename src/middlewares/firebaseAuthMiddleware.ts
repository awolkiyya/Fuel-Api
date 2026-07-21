import { Request, Response, NextFunction } from "express";
const admin = require("../config/firebase");

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    phone?: string;
  };
}

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Firebase token",
    });
  }
};