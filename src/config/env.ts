export const env = {

  // ==========================
  // Application
  // ==========================
  NODE_ENV:
    process.env.NODE_ENV || "development",

  PORT:
    Number(process.env.PORT) || 5000,

  HOST:
    process.env.HOST || "0.0.0.0",



  // ==========================
  // Database
  // ==========================
  DATABASE_URL:
    process.env.DATABASE_URL!,



  // ==========================
  // Authentication
  // ==========================
  JWT_SECRET:
    process.env.JWT_SECRET!,

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",


  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET!,


  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",




  // ==========================
  // OTP
  // ==========================
  OTP_LENGTH:
    Number(process.env.OTP_LENGTH ?? 6),


  OTP_EXPIRE_MINUTES:
    Number(
      process.env.OTP_EXPIRE_MINUTES ?? 5
    ),


  OTP_MAX_ATTEMPTS:
    Number(
      process.env.OTP_MAX_ATTEMPTS ?? 5
    ),



  // ==========================
  // Dagu SMS
  // ==========================
  DAGU_SMS_BASE_URL:
    process.env.DAGU_SMS_BASE_URL!,


  DAGU_SMS_TOKEN:
    process.env.DAGU_SMS_TOKEN!,


  DAGU_SMS_SENDER_ID:
    process.env.DAGU_SMS_SENDER_ID || "9141",




  // ==========================
  // Payment
  // ==========================
  PAYMENT_URL:
    process.env.PAYMENT_URL || "",




  // ==========================
  // Cloudinary
  // ==========================
  CLOUDINARY_CLOUD_NAME:
    process.env.CLOUDINARY_CLOUD_NAME!,


  CLOUDINARY_API_KEY:
    process.env.CLOUDINARY_API_KEY!,


  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET!,




  // ==========================
  // CORS
  // ==========================
  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    "http://localhost:3000",



  // ==========================
  // Security
  // ==========================
  BCRYPT_ROUNDS:
    Number(
      process.env.BCRYPT_ROUNDS ?? 10
    ),

};