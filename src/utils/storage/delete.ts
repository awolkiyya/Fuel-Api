import { bucket } from "../../config/firebase"

export const deleteFromFirebase = async (fileUrl: string) => {
  try {
    if (!fileUrl) return

    const baseUrl = `https://storage.googleapis.com/${bucket.name}/`

    // ensure valid firebase url
    if (!fileUrl.startsWith(baseUrl)) {
      console.warn("Invalid Firebase URL:", fileUrl)
      return
    }

    const filePath = fileUrl.replace(baseUrl, "")

    if (!filePath) return

    await bucket.file(filePath).delete()
  } catch (error) {
    console.error("Failed to delete image:", error)
  }
}