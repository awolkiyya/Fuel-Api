import path from "path"
import { bucket } from "../../config/firebase"

export const uploadToFirebase = async (
  file: Express.Multer.File,
  folder = "uploads"
): Promise<string> => {
  const safeName = `${Date.now()}-${path
    .basename(file.originalname)
    .replace(/\s+/g, "-")}`

  const fileName = `${folder}/${safeName}`

  const fileUpload = bucket.file(fileName)

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    resumable: false,
  })

  await fileUpload.makePublic()

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`
}