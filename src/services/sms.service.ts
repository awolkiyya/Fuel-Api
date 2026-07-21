import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from "axios";

import {
  normalizePhone,
} from "../utils/phone";


interface SmsResponse {

  success: boolean;

  status:
    | "success"
    | "failed";

  httpStatus: number;

  data?: unknown;

  error?: unknown;

  message?: string;

}



interface SmsRequestPayload {

  senderID: string;

  phone: string;

  message: string;

  flash: boolean;

}



class SmsService {


  private readonly client: AxiosInstance;


  private readonly senderId: string;


  private readonly paymentUrl: string;


  private readonly otpExpireMinutes: number;


  private readonly maxRetries = 2;




  constructor() {


    const baseUrl =
      process.env.DAGU_SMS_BASE_URL;


    const token =
      process.env.DAGU_SMS_TOKEN;



    if (!baseUrl || !token) {

      throw new Error(
        "Dagu SMS configuration missing."
      );

    }




    this.senderId =
      process.env.DAGU_SMS_SENDER_ID ??
      "9141";



    this.paymentUrl =
      process.env.PAYMENT_URL ??
      "";



    this.otpExpireMinutes =
      Number(
        process.env.OTP_EXPIRE_MINUTES ?? 5
      );





    this.client =
      axios.create({

        baseURL:
          baseUrl.replace(/\/$/, ""),


        timeout:
          30000,


        headers: {

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",

        },

      });



    this.registerInterceptors();

  }






  /**
   * Axios logging interceptor
   */
  private registerInterceptors() {


    this.client.interceptors.request.use(
      (config)=>{


        console.info(
          "[SMS REQUEST]",
          {
            url:
              config.url,

            method:
              config.method,

            timestamp:
              new Date().toISOString(),

          }
        );


        return config;

      },


      (error)=>{

        console.error(
          "[SMS REQUEST ERROR]",
          error.message
        );


        return Promise.reject(error);

      }

    );




    this.client.interceptors.response.use(

      (response)=>{


        console.info(
          "[SMS RESPONSE]",
          {

            status:
              response.status,


            timestamp:
              new Date().toISOString(),

          }
        );


        return response;

      },


      (error)=>{


        console.error(
          "[SMS RESPONSE ERROR]",
          {

            status:
              error.response?.status,


            message:
              error.message,


            data:
              error.response?.data,

          }
        );


        return Promise.reject(error);

      }

    );

  }









  /**
   * Normal SMS
   */
  async sendByPhone(
    phone:string,
    message:string,
    flash=false
  ):Promise<SmsResponse>{


    return this.sendSms(
      phone,
      message,
      flash
    );

  }









  /**
   * OTP SMS
   */
  async sendOtpMessage(
    phone:string,
    otp:string,
    flash=false
  ):Promise<SmsResponse>{

    console.log("otp",otp)



    const message =
      `Your verification code is ${otp}. ` +
      `Expires in ${this.otpExpireMinutes} minutes. ` +
      `Do not share this code. batam new ishii miwedish wudee`;



    return this.sendSms(
      phone,
      message,
      flash
    );

  }









  /**
   * Payment SMS
   */
  async sendPaymentLink(
    phone:string,
    taxpayerName:string,
    paymentToken:string,
    flash=false
  ):Promise<SmsResponse>{



    const paymentLink =
      `${this.paymentUrl}/p/${paymentToken}`;



    const message =
      `Dear ${taxpayerName}, ` +
      `your revenue payment is pending. ` +
      `Pay securely here: ${paymentLink}`;



    return this.sendSms(
      phone,
      message,
      flash
    );

  }









  /**
   * Bulk SMS
   */
  async sendBulk(
    phones:string[],
    message:string,
    flash=false
  ):Promise<SmsResponse>{


    const payload = {

      senderID:
        this.senderId,


      message,


      phones:
        phones.map(normalizePhone),


      flash,

    };



    return this.executeSmsRequest(
      "/to-phone-list",
      payload
    );

  }









  /**
   * Internal SMS sender
   */
  private async sendSms(
    phone:string,
    message:string,
    flash=false
  ):Promise<SmsResponse>{



    const payload:SmsRequestPayload = {

      senderID:
        this.senderId,


      phone:
        normalizePhone(phone),


      message,


      flash,

    };



    return this.executeSmsRequest(
      "/by-phone",
      payload
    );

  }









  /**
   * Execute SMS request with retry
   */
  private async executeSmsRequest(
    endpoint:string,
    payload:unknown
  ):Promise<SmsResponse>{



    let attempt = 0;



    while(attempt <= this.maxRetries){


      try {


        const response =
          await this.client.post(
            endpoint,
            payload
          );



        return this.formatResponse(
          response
        );


      }
      catch(error){


        attempt++;



        console.warn(
          "[SMS RETRY]",
          {
            attempt,
            endpoint,
          }
        );



        if(
          attempt >
          this.maxRetries
        ){

          return this.handleError(
            error
          );

        }


        await this.delay(
          attempt * 1000
        );

      }

    }



    return {

      success:false,

      status:"failed",

      httpStatus:500,

      message:
        "SMS sending failed",

    };

  }









  /**
   * Format successful response
   */
  private formatResponse(
    response:AxiosResponse
  ):SmsResponse{


    const success =
      response.status >=200 &&
      response.status <300;



    return {

      success,


      status:
        success
        ? "success"
        : "failed",



      httpStatus:
        response.status,



      data:
        response.data,



      message:
        success
        ? "SMS sent successfully"
        : "SMS failed",

    };

  }









  /**
   * Error handler
   */
  private handleError(
    error:unknown
  ):SmsResponse{



    if(error instanceof AxiosError){


      return {


        success:false,


        status:"failed",


        httpStatus:
          error.response?.status ??
          500,


        error:
          error.response?.data ??
          error.message,



        message:
          "SMS provider request failed",

      };


    }





    return {


      success:false,


      status:"failed",


      httpStatus:500,


      error:
        String(error),



      message:
        "Unknown SMS error",

    };


  }








  /**
   * Delay helper
   */
  private delay(
    ms:number
  ){

    return new Promise(
      resolve =>
        setTimeout(resolve,ms)
    );

  }


}



export default new SmsService();