import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidateSource = "body" | "params" | "query";

export const validate =
  (schema: ZodSchema, source: ValidateSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      // =========================
      // 🔍 LOG INPUT (DEV ONLY)
      // =========================
      if (process.env.NODE_ENV !== "production") {
        console.log("➡️ VALIDATION INPUT:", {
          source,
          url: req.originalUrl,
          method: req.method,
          data: req[source],
        });
      }

      const result = schema.parse(req[source]);

      // attach validated data (clean contract)
      (req as any).validated = result;

      next();
    } catch (err: any) {
      const issues =
        err?.issues?.map((i: any) => ({
          field: i.path?.join(".") || "unknown",
          message: i.message,
          code: i.code,
        })) || [];

      // =========================
      // ❌ LOG VALIDATION ERROR
      // =========================
      console.error("❌ VALIDATION FAILED:", {
        url: req.originalUrl,
        method: req.method,
        input: req[source],
        errors: issues,
      });

      const error: any = new Error("Validation failed");
      error.code = "VALIDATION_ERROR";
      error.statusCode = 400;
      error.errors = issues;

      return next(error);
    }
  };