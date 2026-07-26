import { Request, Response, NextFunction } from "express";

export const aiAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: "Missing Authorization header",
    });
    return;
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      success: false,
      message: "Invalid Authorization format",
    });
    return;
  }

  const expectedKey = process.env.BACKEND_API_KEY;

  if (!expectedKey) {
    console.error("BACKEND_API_KEY is not configured");

    res.status(500).json({
      success: false,
      message: "Authentication service unavailable",
    });
    return;
  }

  if (token !== expectedKey) {
    res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
    return;
  }

  next();
};