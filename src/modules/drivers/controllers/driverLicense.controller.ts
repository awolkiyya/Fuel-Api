import { Response } from "express";

import { DriverLicenseStatus } from "@prisma/client";
import prisma from "../../../config/db";
import { sendError } from "../../../utils/apiError";
import { sendResponse } from "../../../utils/apiResponse";

export class DriverLicenseController {
  /* -----------------------------
     GET CURRENT DRIVER'S LICENSE
  ------------------------------ */
  static async getMyLicense(req: any, res: Response) {
    try {
      const userId = req.user.id;

      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId },
        include: { license: true },
      });

      if (!driverProfile) {
        return sendError(res, {
          statusCode: 404,
          message: "Driver profile not found",
          code: "DRIVER_PROFILE_NOT_FOUND",
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        message: "License fetched successfully",
        data: {
          license: driverProfile.license,
        },
      });
    } catch (error: any) {
      return sendError(res, {
        statusCode: 500,
        message: error.message || "Failed to fetch license",
        code: "FETCH_LICENSE_FAILED",
      });
    }
  }

  /* -----------------------------
     UPLOAD LICENSE FILE
     Standalone step — stores the file and hands back a URL. The
     actual DriverLicense row is written in submit() below.

     Relies on `upload.single("license_file")` (your shared
     multer middleware) having already run, so req.file is
     populated the same way it is in BusinessLicenseController.
  ------------------------------ */
  static async uploadLicenseFile(req: any, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, {
          statusCode: 400,
          message: "No file uploaded",
          code: "FILE_REQUIRED",
        });
      }

      // TODO: your upload middleware may already attach the final
      // stored URL/path onto req.file (e.g. req.file.path or a
      // custom field), the same way BusinessLicenseController's
      // create/update presumably reads it off req.file after
      // upload.single("document") runs. Point this at whatever
      // that actual field is instead of guessing "path" here.
      const fileUrl = req.file.path ?? req.file.filename;

      return sendResponse(res, {
        statusCode: 200,
        message: "File uploaded successfully",
        data: {
          file: fileUrl,
        },
      });
    } catch (error: any) {
      return sendError(res, {
        statusCode: 500,
        message: error.message || "File upload failed",
        code: "UPLOAD_FAILED",
      });
    }
  }

  /* -----------------------------
     SUBMIT / RENEW LICENSE
     Upserts the DriverLicense row and resets it to PENDING so an
     admin re-verifies — a renewal shouldn't silently keep an old
     ACTIVE/EXPIRED status with a swapped-out document underneath.
  ------------------------------ */
  static async submit(req: any, res: Response) {
    try {
      const userId = req.user.id;

      const { license_number, license_file } = req.body;

      if (!license_number || !license_file) {
        return sendError(res, {
          statusCode: 400,
          message: "license_number and license_file are required",
          code: "MISSING_FIELDS",
        });
      }

      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId },
      });

      if (!driverProfile) {
        return sendError(res, {
          statusCode: 404,
          message: "Driver profile not found",
          code: "DRIVER_PROFILE_NOT_FOUND",
        });
      }

      const license = await prisma.driverLicense.upsert({
        where: { driverId: driverProfile.id },

        create: {
          driverId: driverProfile.id,
          licenseNumber: license_number,
          documentUrl: license_file,
          issuedAt: new Date(),
          status: DriverLicenseStatus.PENDING,
        },

        update: {
          licenseNumber: license_number,
          documentUrl: license_file,
          issuedAt: new Date(),
          status: DriverLicenseStatus.PENDING,

          // Clear any prior admin decision — a new document means
          // a fresh review, not a stale rejection reason or
          // leftover verifiedAt from the previous submission.
          verifiedAt: null,
          verifiedBy: null,
          rejectionReason: null,
        },
      });

      return sendResponse(res, {
        statusCode: 200,
        message: "License submitted for verification",
        data: { license },
      });
    } catch (error: any) {
      return sendError(res, {
        statusCode: 500,
        message: error.message || "Failed to submit license",
        code: "SUBMIT_LICENSE_FAILED",
      });
    }
  }
}