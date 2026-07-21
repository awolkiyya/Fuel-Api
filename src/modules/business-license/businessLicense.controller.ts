import { Request, Response } from "express";
import { BusinessLicenseService } from "./businessLicense.service";
import { createBusinessLicenseSchema } from "./businessLicense.request";

export class BusinessLicenseController {
/**
 * CREATE LICENSE (USER)
 */
static async create(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    // ================= AUTH CHECK =================
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    // ================= VALIDATION =================
    const parsed = createBusinessLicenseSchema.parse(req.body);

    const file = req.file as Express.Multer.File | undefined;

    // ================= SERVICE CALL =================
    const license = await BusinessLicenseService.create(
      {
        ...parsed,
        userId,
      },
      file?.path
    );

    // ================= SUCCESS RESPONSE =================
    return res.status(201).json({
      success: true,
      message: "Business license created successfully.",
      data: license,
    });

  } catch (error: any) {
    console.error("❌ Business License Create Error:", error);

    // ================= ZOD VALIDATION ERROR =================
    if (error?.name === "ZodError") {
      return res.status(422).json({
        success: false,
        message: "Validation failed. Please check your input data.",
        errors: error.errors,
      });
    }

    // ================= KNOWN SERVICE ERROR =================
    if (error?.message) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // ================= UNKNOWN ERROR =================
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating business license.",
    });
  }
}

/**
 * GET MY LICENSE
 */
static async getMyLicense(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    const required =
      await BusinessLicenseService.isLicenseRequired(userId);

    // NOT REQUIRED
    if (!required) {
      return res.json({
        success: true,
        message: "Business license not required",
        data: {
          required: false,
          registered: false,
          license: null,
        },
      });
    }

    const license =
      await BusinessLicenseService.getLicenseByUserId(userId);

    // REQUIRED BUT NOT REGISTERED
    if (!license) {
      return res.json({
        success: true,
        message: "Business license required but not registered",
        data: {
          required: true,
          registered: false,
          license: null,
        },
      });
    }

    // REGISTERED
    return res.json({
      success: true,
      message: "Business license retrieved successfully",
      data: {
        required: true,
        registered: true,
        license,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
}

  /**
   * RENEW REQUEST (USER)
   * - only replaces document
   * - resets status for admin review
   */
  static async renewRequest(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
  
      const file = req.file as Express.Multer.File | undefined;
  
      const { expiryDate } = req.body;
  
      // ================= VALIDATION =================
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Document is required",
        });
      }
  
      if (!expiryDate) {
        return res.status(400).json({
          success: false,
          message: "Expiry date is required",
        });
      }
  
      const parsedExpiry = new Date(expiryDate);
  
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date format",
        });
      }
  
      // ================= SERVICE CALL =================
      const result = await BusinessLicenseService.renewRequest(
        userId,
        file.path,
        parsedExpiry
      );
  
      return res.json({
        success: true,
        message: "Renewal request submitted successfully",
        data: result,
      });
  
    } catch (error: any) {
      console.error("❌ Renew Error:", error);
  
      return res.status(500).json({
        success: false,
        message: error.message || "Renew failed",
      });
    }
  }

  /**
 * UPDATE LICENSE (USER)
 * - full or partial update
 * - can optionally replace document
 */
static async update(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    // ================= AUTH CHECK =================
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    // ================= VALIDATION =================
    const parsed = createBusinessLicenseSchema.parse(req.body);

    const file = req.file as Express.Multer.File | undefined;

    // ================= SERVICE CALL =================
    const updatedLicense = await BusinessLicenseService.update(
      userId,
      {
        ...parsed,
      },
      file?.path
    );

    // ================= SUCCESS RESPONSE =================
    return res.status(200).json({
      success: true,
      message: "Business license updated successfully.",
      data: updatedLicense,
    });

  } catch (error: any) {
    console.error("❌ Business License Update Error:", error);

    // ================= ZOD ERROR =================
    if (error?.name === "ZodError") {
      return res.status(422).json({
        success: false,
        message: "Validation failed. Please check your input data.",
        errors: error.errors,
      });
    }

    // ================= KNOWN ERROR =================
    if (error?.message) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // ================= UNKNOWN ERROR =================
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating business license.",
    });
  }
}






}


