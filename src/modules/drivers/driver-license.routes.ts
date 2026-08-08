import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware";
import upload from "../../middlewares/upload.middleware";
import { DriverLicenseController } from "./controllers/driverLicense.controller";

const router = Router();

/* -----------------------------
   GET CURRENT DRIVER'S LICENSE
------------------------------ */
router.get("/", authMiddleware, DriverLicenseController.getMyLicense);

/* -----------------------------
   UPLOAD LICENSE FILE
   (matches: _api.upload("/driver/license/upload", ..., fieldName: "license_file"))

   Kept as its own step (unlike businessLicense's single combined
   POST /) because the Flutter DriverLicenseController already
   uploads the file first to get a URL, then submits the license
   record separately — changing that would mean touching the
   Flutter side too.
------------------------------ */
router.post(
  "/upload",
  authMiddleware,
  upload.single("license_file"),
  DriverLicenseController.uploadLicenseFile
);

/* -----------------------------
   SUBMIT / RENEW LICENSE
   (matches: _api.post("/driver/license", ...))
------------------------------ */
router.post("/", authMiddleware, DriverLicenseController.submit);

export default router;