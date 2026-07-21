import { Router } from "express";
import {
  register,
  login,
  me,
  logout,
  requestOtp,
  verifyDriverOtp,
  resendOtp,
} from "./auth.controller";

import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../../schemas/auth.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

// 🔐 AUTH MIDDLEWARE (you should already have this)

const router = Router();

/* -----------------------------
   REGISTER
------------------------------ */
router.post(
  "/register",
  validate(registerSchema),
  register
);

/* -----------------------------
   LOGIN
------------------------------ */
router.post(
  "/login",
  validate(loginSchema),
  login
);


/* ----------------------------------
   OTP Authentication
----------------------------------- */

// Request OTP
router.post(
   "/otp/request",
   requestOtp
 );
 
 
 // Resend OTP
 router.post(
   "/otp/resend",
   resendOtp
 );
 
 
 // Verify OTP & Login
 router.post(
   "/otp/verify",
   verifyDriverOtp
 );



/* -----------------------------
   GET CURRENT USER (PROTECTED)
------------------------------ */
router.get(
  "/me",
  authMiddleware, // 🔥 REQUIRED
  me
);

/* -----------------------------
   LOGOUT
------------------------------ */
router.post(
  "/logout",
  authMiddleware, // optional but recommended
  logout
);

export default router;


/* -----------------------------
   FIREBASE LOGIN
------------------------------ */
// router.post("/firebase-login", firebaseLogin);