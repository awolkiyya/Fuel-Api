import bcrypt from "bcrypt";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { OtpType } from "@prisma/client";

import prisma from "../config/db";

import {
  normalizePhone,
  isValidEthiopianPhone,
} from "../utils/phone";


class OtpService {


  private readonly OTP_LENGTH = 6;


  private readonly OTP_EXPIRE_MINUTES =
    Number(
      process.env.OTP_EXPIRE_MINUTES ?? 5
    );


  private readonly MAX_ATTEMPTS =
    Number(
      process.env.OTP_MAX_ATTEMPTS ?? 5
    );


  private readonly REQUEST_INTERVAL_SECONDS =
    Number(
      process.env.OTP_REQUEST_INTERVAL ?? 60
    );


  private readonly BCRYPT_ROUNDS =
    Number(
      process.env.BCRYPT_ROUNDS ?? 10
    );






  /**
   * Generate secure OTP
   */
  private generateOtp(): string {


    const max =
      10 ** this.OTP_LENGTH;


    return crypto
      .randomInt(
        max / 10,
        max
      )
      .toString();


  }








  /**
   * Normalize OTP Type
   */
  private normalizeType(
    type?: string | OtpType
  ): OtpType {


    const otpType =
      String(
        type ?? OtpType.LOGIN
      )
      .toUpperCase();



    if(
      !Object.values(OtpType)
        .includes(
          otpType as OtpType
        )
    ){

      throw new Error(
        "Invalid OTP type."
      );

    }



    return otpType as OtpType;

  }








  /**
   * OTP request rate limit
   *
   * Prevent:
   * - multiple resend spam
   * - SMS cost abuse
   */
  private async checkRateLimit(
    phone:string,
    type:OtpType
  ):Promise<void>{



    const recentOtp =
      await prisma.otpVerification.findFirst({

        where:{

          phone,

          type,

          createdAt:{

            gte:
              new Date(
                Date.now() -
                this.REQUEST_INTERVAL_SECONDS *
                1000
              ),

          },

        },


        orderBy:{

          createdAt:
            "desc",

        }

      });






    if(recentOtp){


      const remaining =
        Math.ceil(

          (
            this.REQUEST_INTERVAL_SECONDS *
            1000

            -

            (
              Date.now()
              -
              recentOtp.createdAt.getTime()
            )

          )

          /

          1000

        );



      throw new Error(
        `Please wait ${remaining} seconds before requesting another OTP.`
      );


    }


  }









  /**
   * Create OTP
   */
  async create(params:{

    phone:string;

    type?:OtpType | string;

    userId?:string;

    ipAddress?:string;

    userAgent?:string;

  }):Promise<string>{



    const phone =
      normalizePhone(
        params.phone
      );



    if(
      !isValidEthiopianPhone(phone)
    ){

      throw new Error(
        "Invalid Ethiopian phone number."
      );

    }





    const otpType =
      this.normalizeType(
        params.type
      );






    await this.checkRateLimit(
      phone,
      otpType
    );






    const otp =
      this.generateOtp();





    const codeHash =
      await bcrypt.hash(

        otp,

        this.BCRYPT_ROUNDS

      );








    await prisma.$transaction(
      async(tx)=>{


        /**
         * Expire previous OTPs
         */
        await tx.otpVerification.updateMany({

          where:{

            phone,

            type:
              otpType,

            verifiedAt:
              null,

          },


          data:{

            expiresAt:
              new Date(),

          }

        });







        /**
         * Create new OTP
         */
        await tx.otpVerification.create({

          data:{


            phone,


            userId:
              params.userId,



            type:
              otpType,



            codeHash,



            expiresAt:
              addMinutes(

                new Date(),

                this.OTP_EXPIRE_MINUTES

              ),



            ipAddress:
              params.ipAddress,



            userAgent:
              params.userAgent,


          }


        });


      }
    );





    return otp;


  }









  /**
   * Mark OTP SMS sent
   */
  async markSent(
    phone:string,
    type:OtpType | string
  ):Promise<void>{



    const normalizedPhone =
      normalizePhone(phone);



    const otpType =
      this.normalizeType(type);





    const otp =
      await prisma.otpVerification.findFirst({

        where:{

          phone:
            normalizedPhone,


          type:
            otpType,


          verifiedAt:
            null,

        },


        orderBy:{

          createdAt:
            "desc",

        }

      });





    if(!otp){

      return;

    }






    await prisma.otpVerification.update({

      where:{
        id:otp.id,
      },


      data:{

        sentAt:
          new Date(),

      }

    });


  }









  /**
   * Verify OTP
   */
  async verify(params:{

    phone:string;

    type:OtpType | string;

    code:string;

  }){



    const phone =
      normalizePhone(
        params.phone
      );



    const otpType =
      this.normalizeType(
        params.type
      );





    const otp =
      await prisma.otpVerification.findFirst({

        where:{


          phone,


          type:
            otpType,


          verifiedAt:
            null,



          expiresAt:{

            gt:
              new Date(),

          },


        },


        orderBy:{

          createdAt:
            "desc",

        }


      });






    if(!otp){


      return {

        success:false,

        message:
          "OTP expired or not found.",

      };


    }








    if(
      otp.failedAttempts >=
      this.MAX_ATTEMPTS
    ){


      return {

        success:false,

        message:
          "Maximum OTP attempts exceeded.",

      };


    }








    const matched =
      await bcrypt.compare(

        params.code,

        otp.codeHash

      );







    if(!matched){



      await prisma.otpVerification.update({

        where:{
          id:otp.id,
        },


        data:{

          failedAttempts:{
            increment:1,
          },

        }

      });





      return {

        success:false,

        message:
          "Invalid OTP.",

      };


    }







    await prisma.otpVerification.update({

      where:{
        id:otp.id,
      },


      data:{

        verifiedAt:
          new Date(),

      }

    });







    return {

      success:true,

      userId:
        otp.userId,

    };


  }









  /**
   * Check verified OTP
   */
  async isVerified(
    phone:string,
    type:OtpType | string
  ):Promise<boolean>{



    const record =
      await prisma.otpVerification.findFirst({

        where:{


          phone:
            normalizePhone(phone),


          type:
            this.normalizeType(type),


          verifiedAt:{

            not:null,

          },


        },


        orderBy:{

          verifiedAt:
            "desc",

        }

      });





    return Boolean(record);


  }









  /**
   * Delete OTP history
   */
  async deleteByPhone(
    phone:string
  ){


    return prisma.otpVerification.deleteMany({

      where:{

        phone:
          normalizePhone(phone),

      }

    });


  }









  /**
   * Cleanup expired OTPs
   */
  async cleanupExpired(){


    return prisma.otpVerification.deleteMany({

      where:{

        expiresAt:{

          lt:
            new Date(),

        }

      }

    });


  }

  /**
 * Check OTP resend cooldown
 */
async checkResendCooldown(
  phone:string,
  type:OtpType
){

  phone =
    normalizePhone(phone);



  const recentOtp =
    await prisma.otpVerification.findFirst({

      where:{

        phone,

        type,

        createdAt:{
          gte:new Date(
            Date.now() - 60 * 1000
          ),
        },

      },


      orderBy:{
        createdAt:"desc",
      },

    });




  if(recentOtp){

    throw new Error(
      "Please wait before requesting another OTP."
    );

  }

}


}


export default new OtpService();