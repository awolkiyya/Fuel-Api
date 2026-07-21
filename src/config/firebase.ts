import admin from "firebase-admin"
import serviceAccount from "./firebase-service-account.json"

// Prevent re-initialization (important in dev/hot-reload)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccount as admin.ServiceAccount
    ),

    // 🔥 ADD STORAGE CONFIG
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

/* =========================
   EXPORTS (clean usage)
========================= */
export const bucket = admin.storage().bucket()
export default admin