import fs from "fs";
import { UPLOAD_PATHS } from "../config/upload.config";

export const ensureUploadDirs = () => {
  Object.values(UPLOAD_PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};