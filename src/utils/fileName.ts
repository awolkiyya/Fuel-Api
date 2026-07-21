import path from "path";

export const generateSafeFileName = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const baseName = file.originalname
    .replace(ext, "")
    .replace(/[^a-zA-Z0-9]/g, "-") // sanitize
    .substring(0, 50);

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return `${baseName}-${uniqueSuffix}${ext}`;
};