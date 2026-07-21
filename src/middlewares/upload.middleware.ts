import multer, { FileFilterCallback, MulterError } from "multer";
import { Request } from "express";
import fs from "fs";
import path from "path";

import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_PATHS,
} from "../config/upload.config";

import { generateSafeFileName } from "../utils/fileName";

/**
 * =====================================
 * ENSURE DIRECTORY EXISTS
 * =====================================
 */
const ensureDir = (dir: string) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created upload directory: ${dir}`);
    }
  } catch (err) {
    console.error("❌ Failed to create directory:", err);
  }
};

/**
 * =====================================
 * GET DESTINATION FOLDER
 * =====================================
 */
const getDestination = (file: Express.Multer.File) => {
  if (file.mimetype.startsWith("image/")) {
    return UPLOAD_PATHS.IMAGES;
  }
  return UPLOAD_PATHS.DOCUMENTS;
};

/**
 * =====================================
 * STORAGE CONFIG
 * =====================================
 */
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    try {
      const dir = getDestination(file);
      ensureDir(dir);

      console.log("📥 Upload destination:", dir);
      console.log("📄 Incoming file:", {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });

      cb(null, dir);
    } catch (error) {
      console.error("❌ Storage destination error:", error);
      cb(error as Error, "");
    }
  },

  filename: (req: Request, file, cb) => {
    try {
      const safeName = generateSafeFileName(file);

      console.log("📝 Generated filename:", safeName);

      cb(null, safeName);
    } catch (error) {
      console.error("❌ Filename generation error:", error);
      cb(error as Error, "");
    }
  },
});

/**
 * =====================================
 * FILE FILTER (SECURITY LAYER)
 * =====================================
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  try {
    const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf"];

    const ext = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(".", "");

    const mimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const extValid = allowedExt.includes(ext);

    console.log("🔍 File validation:", {
      originalName: file.originalname,
      mime: file.mimetype,
      extension: ext,
      mimeValid,
      extValid,
    });

    if (!mimeValid || !extValid) {
      console.error("❌ File rejected due to invalid type");
      return cb(
        new Error(
          "Only images (jpg, png, webp) and PDFs are allowed"
        )
      );
    }

    cb(null, true);
  } catch (error) {
    console.error("❌ File filter error:", error);
    cb(error as Error);
  }
};

/**
 * =====================================
 * MULTER INSTANCE
 * =====================================
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * =====================================
 * MULTER ERROR HANDLER (IMPORTANT)
 * =====================================
 */
export const multerErrorHandler = (
  err: any,
  req: Request,
  res: any,
  next: any
) => {
  console.error("🚨 Multer Error:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
      });
    }

    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  next();
};

export default upload;