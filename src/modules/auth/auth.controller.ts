import { Request, Response } from "express";

import {
  registerUser,
  loginUser,
} from "./auth.service";


import otpService from "../../services/otp.service";
import smsService from "../../services/sms.service";


import {
  OtpType,
  UserRole,
  UserStatus,
} from "@prisma/client";


import {
  sendResponse,
} from "../../utils/apiResponse";


import {
  sendError,
} from "../../utils/apiError";


import {
  userResource,
} from "../users/user.resource";


import prisma from "../../config/db";


import {
  isValidEthiopianPhone,
  normalizePhone,
} from "../../utils/phone";


import {
  generateToken,
} from "../../utils/jwt";



/* -----------------------------
   REGISTER
------------------------------ */

export const register = async (
  req: Request,
  res: Response
) => {

  try {

    const result =
      await registerUser(
        req.body
      );


    return sendResponse(res,{
      statusCode:201,

      message:
        "User registered successfully",

      data:
        result,

    });


  }catch(error:any){

    return sendError(res,{

      statusCode:400,

      message:
        error.message ||
        "Registration failed",

      code:
        "REGISTER_FAILED",

    });

  }

};







/* -----------------------------
   LOGIN WITH PASSWORD
------------------------------ */

export const login = async (
  req: Request,
  res: Response
) => {


  try {


    const result =
      await loginUser(
        req.body
      );



    return sendResponse(res,{

      statusCode:200,

      message:
        "Login successful",


      data:{

        user:
          result.user,


        accessToken:
          result.token,

      },


    });



  }catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return sendError(res, {
        statusCode: error.statusCode ?? 401,
        message: error.message ?? "Invalid credentials",
        code: "LOGIN_FAILED",
    });
}

};







/* -----------------------------
   REQUEST OTP
------------------------------ */

export const requestOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone, type } = req.body;

    /* -----------------------------
       Validate Phone
    ------------------------------ */

    if (!phone) {
      return sendError(res, {
        statusCode: 400,
        message: "Phone number is required",
        code: "PHONE_REQUIRED",
      });
    }

    /* -----------------------------
       Normalize OTP Type
    ------------------------------ */

    const normalizedType = (
      typeof type === "string"
        ? type.toUpperCase()
        : OtpType.LOGIN
    ) as OtpType;

    /* -----------------------------
       Validate OTP Type
    ------------------------------ */

    if (!Object.values(OtpType).includes(normalizedType)) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid OTP type",
        code: "INVALID_OTP_TYPE",
      });
    }

    /* -----------------------------
       Create OTP
    ------------------------------ */

    const otp = await otpService.create({
      phone,
      type: normalizedType,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    

    /* -----------------------------
       Send SMS
    ------------------------------ */

    const sms = await smsService.sendOtpMessage(
      phone,
      otp
    );

    if (!sms.success) {
      return sendError(res, {
        statusCode: 500,
        message: "Failed to send OTP SMS",
        code: "SMS_FAILED",
      });
    }

    /* -----------------------------
       Mark OTP as Sent
    ------------------------------ */

    await otpService.markSent(
      phone,
      normalizedType
    );

    /* -----------------------------
       Success Response
    ------------------------------ */

    return sendResponse(res, {
      statusCode: 200,
      message: "OTP sent successfully",
      data: {
        phone: normalizePhone(phone),
        type: normalizedType,
      },
    });

  } catch (error: any) {
    return sendError(res, {
      statusCode: 400,
      message: error.message || "OTP request failed",
      code: "OTP_REQUEST_FAILED",
    });
  }
};








/* -----------------------------
   VERIFY DRIVER OTP LOGIN
------------------------------ */

export const verifyDriverOtp = async (
  req: Request,
  res: Response
) => {

  try {


    const {
      phone,
      code,
    } = req.body;



    if(!phone || !code){

      return sendError(res,{
        statusCode:400,
        message:"Phone and OTP are required",
        code:"OTP_REQUIRED",
      });

    }



    const normalizedPhone =
      normalizePhone(phone);




    /* -----------------------------
       Verify OTP
    ------------------------------ */

    const otpResult =
      await otpService.verify({

        phone:
          normalizedPhone,

        code,

        type:
          OtpType.LOGIN,

      });



    if(!otpResult.success){

      return sendError(res,{
        statusCode:401,
        message:otpResult.message,
        code:"OTP_INVALID",
      });

    }







    /* -----------------------------
       Find Existing Driver
    ------------------------------ */

    let user =
      await prisma.user.findUnique({

        where:{
          phone:
            normalizedPhone,
        },

        include:{
          driverProfile:true,
        }

      });







    /* -----------------------------
       Create New Driver Account
    ------------------------------ */

    if(!user){


      user =
        await prisma.user.create({

          data:{


            phone:
              normalizedPhone,


            full_name:
              "New Driver",



            role:
              UserRole.driver,


            status:
              UserStatus.ACTIVE,


            phoneVerifiedAt:
              new Date(),

          },


          include:{
            driverProfile:true,
          }

        });


    }







    /* -----------------------------
       Update Phone Verification
    ------------------------------ */

    if(!user.phoneVerifiedAt){


      user =
        await prisma.user.update({

          where:{
            id:user.id,
          },


          data:{
            phoneVerifiedAt:
              new Date(),
          },


          include:{
            driverProfile:true,
          }

        });


    }








    /* -----------------------------
       Check Driver Profile
    ------------------------------ */

    const hasDriverProfile =
      !!user.driverProfile;







    /* -----------------------------
       Generate JWT
    ------------------------------ */

    const token =
      generateToken({

        id:
          user.id,

        role:
          user.role,

      });








    return sendResponse(res,{

      statusCode:200,


      message:
        hasDriverProfile
        ? "Driver login successful"
        : "Continue driver onboarding",



      data:{


        user:
          userResource(user),



        accessToken:
          token,



        onboardingRequired:
          !hasDriverProfile,



        nextStep:
          hasDriverProfile
          ? "DASHBOARD"
          : "DRIVER_PROFILE",

      },


    });




  }catch(error:any){


    console.error(
      "DRIVER OTP LOGIN ERROR:",
      error
    );


    return sendError(res,{

      statusCode:500,

      message:
        error.message ||
        "Driver OTP verification failed",

      code:
        "DRIVER_LOGIN_FAILED",

    });


  }

};


/* -----------------------------
   RESEND OTP
------------------------------ */

export const resendOtp = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      phone,
      type = OtpType.LOGIN,
    } = req.body;



    if (!phone) {

      return sendError(res, {

        statusCode: 400,

        message:
          "Phone number is required",

        code:
          "PHONE_REQUIRED",

      });

    }




    const normalizedPhone =
      normalizePhone(phone);





    if (!isValidEthiopianPhone(normalizedPhone)) {

      return sendError(res, {

        statusCode: 400,

        message:
          "Invalid Ethiopian phone number",

        code:
          "INVALID_PHONE",

      });

    }







    /*
      Check resend cooldown

      Prevent:
      - spam requests
      - SMS cost abuse
      - brute force attempts
    */

    await otpService.checkResendCooldown(
      normalizedPhone,
      type
    );








    /*
      Create new OTP
    */

    const otp =
      await otpService.create({

        phone:
          normalizedPhone,

        type,

        ipAddress:
          req.ip,

        userAgent:
          req.headers["user-agent"],

      });








    /*
      Send SMS
    */

    const sms =
      await smsService.sendOtpMessage(

        normalizedPhone,

        otp

      );






    if (!sms.success) {


      return sendError(res, {

        statusCode: 500,

        message:
          "Failed to send OTP SMS",

        code:
          "SMS_FAILED",

      });


    }







    /*
      Mark OTP as sent
    */

    await otpService.markSent(

      normalizedPhone,

      type as OtpType

    );







    return sendResponse(res, {

      statusCode: 200,

      message:
        "OTP resent successfully",

      data: {

        phone:
          normalizedPhone,

      },


    });







  } catch(error:any) {


    return sendError(res, {

      statusCode:
        error.message?.includes("wait")
          ? 429
          : 400,


      message:
        error.message ||
        "OTP resend failed",


      code:
        "OTP_RESEND_FAILED",


    });


  }

};






/* -----------------------------
   GET CURRENT USER (/me)
------------------------------ */

export const me = async (
  req:any,
  res:Response
)=>{

  try {


    const userId =
      req.user.id;




    const user =
      await prisma.user.findUnique({

        where:{
          id:userId,
        },


        include:{

          managedStation:true,

          driverProfile:true,

        },

      });






    if(!user){


      return sendError(res,{

        statusCode:404,

        message:
          "User not found",

        code:
          "USER_NOT_FOUND",

      });


    }







    /* -----------------------------
       Check Driver Profile
    ------------------------------ */

    const hasDriverProfile =
      !!user.driverProfile;








    return sendResponse(res,{

      statusCode:200,

      message:
        "User fetched successfully",



      data:{


        user:
          userResource(user),



        hasDriverProfile,



        onboardingRequired:
          !hasDriverProfile,



        nextStep:
          hasDriverProfile
          ? "DASHBOARD"
          : "DRIVER_PROFILE",


      },


    });





  }catch(error:any){


    return sendError(res,{

      statusCode:500,

      message:
        error.message ||
        "Failed to fetch user",

      code:
        "FETCH_ME_FAILED",

    });


  }

};







/* -----------------------------
   LOGOUT
------------------------------ */

export const logout = async (
  _req:Request,
  res:Response
)=>{


  return sendResponse(res,{

    statusCode:200,

    message:
      "Logged out successfully",

    data:{

      success:true,

    },

  });


};