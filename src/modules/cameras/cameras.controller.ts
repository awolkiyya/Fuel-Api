import { Request, Response } from "express";
import prisma from "../../config/db";
import ffmpeg from "fluent-ffmpeg"
import ffprobePath from "ffprobe-static"


ffmpeg.setFfprobePath(ffprobePath.path)

/* =========================================================
   HELPERS
========================================================= */

const handleError = (res: Response, error: any, message: string) => {
  console.error("Camera Controller Error:", error);
  return res.status(500).json({
    success: false,
    message,
  });
};

/* =========================================================
   GET ALL CAMERAS
========================================================= */
export const getCameras = async (_: Request, res: Response) => {
  try {
    const cameras = await prisma.camera.findMany({
      include: {
        station: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: cameras,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch cameras");
  }
};

/* =========================================================
   GET CAMERA BY ID
========================================================= */
export const getCameraById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    const camera = await prisma.camera.findUnique({
      where: { id },
      include: {
        station: true,
      },
    });

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: "Camera not found",
      });
    }

    return res.json({
      success: true,
      data: camera,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch camera");
  }
};




/* =========================================================
   CREATE CAMERA
========================================================= */
/* =========================================================
   CREATE CAMERA
========================================================= */
export const createCamera = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      name,
      stationId,
      protocol,
      host,
      port,
      streamPath,
      authType,
      username,
      password,
      location,
      latitude,
      longitude,
      resolution,
      fps,
      codec,
      aiEnabled,
      isActive,
    } = req.body;



    const camera =
      await prisma.$transaction(
        async (tx) => {


          /*
            If this camera becomes AI camera,
            disable previous AI camera
          */

          if(aiEnabled === true){

            await tx.camera.updateMany({

              where:{
                stationId,
                aiEnabled:true,
              },

              data:{
                aiEnabled:false,
              }

            });

          }



          return tx.camera.create({

            data:{

              name,

              station:{
                connect:{
                  id:stationId
                }
              },


              protocol,

              host,

              port:port ?? 554,

              path:streamPath,


              authType:
                authType ?? "NONE",


              username:
                username ?? null,


              passwordEncrypted:
                password
                  ? encrypt(password)
                  : null,


              location:
                location ?? null,


              latitude:
                latitude ?? null,


              longitude:
                longitude ?? null,


              resolution:
                resolution ?? null,


              fps:
                fps ?? null,


              codec:
                codec ?? null,


              aiEnabled:
                aiEnabled ?? false,


              isActive:
                isActive ?? true,

            }

          });


        });



    return res.status(201).json({

      success:true,

      message:
        "Camera created successfully",

      data:camera,

    });



  } catch(error){

    return handleError(
      res,
      error,
      "Failed to create camera"
    );

  }

};

/* =========================================================
   UPDATE CAMERA
========================================================= */
/* =========================================================
   UPDATE CAMERA
========================================================= */
export const updateCamera = async (
  req: Request,
  res: Response
) => {

try {


const id =
 Array.isArray(req.params.id)
 ? req.params.id[0]
 : req.params.id;



const existing =
 await prisma.camera.findUnique({
  where:{id},
 });



if(!existing){

 return res.status(404).json({
  success:false,
  message:"Camera not found"
 });

}



const {
 name,
 protocol,
 host,
 port,
 streamPath,
 authType,
 username,
 password,
 location,
 latitude,
 longitude,
 resolution,
 fps,
 codec,
 aiEnabled,
 isActive,
} = req.body;



const updated =
 await prisma.$transaction(
 async(tx)=>{


   /*
     If enabling AI,
     disable other station cameras
   */

   if(
     aiEnabled === true &&
     existing.stationId
   ){

     await tx.camera.updateMany({

       where:{

         stationId:
           existing.stationId,

         id:{
           not:id
         },

         aiEnabled:true,

       },

       data:{
         aiEnabled:false
       }

     });

   }



   return tx.camera.update({

     where:{id},

     data:{


       ...(name !== undefined && {
         name
       }),


       ...(protocol !== undefined && {
         protocol
       }),


       ...(host !== undefined && {
         host
       }),


       ...(port !== undefined && {
         port
       }),


       ...(streamPath !== undefined && {
         path:streamPath
       }),



       ...(authType !== undefined && {
         authType
       }),



       ...(username !== undefined && {
         username
       }),



       ...(password && {
         passwordEncrypted:
           encrypt(password)
       }),



       ...(location !== undefined && {
         location
       }),


       ...(latitude !== undefined && {
         latitude
       }),


       ...(longitude !== undefined && {
         longitude
       }),



       ...(resolution !== undefined && {
         resolution
       }),


       ...(fps !== undefined && {
         fps
       }),


       ...(codec !== undefined && {
         codec
       }),



       ...(aiEnabled !== undefined && {
         aiEnabled
       }),



       ...(isActive !== undefined && {
         isActive
       }),


     }

   });


 });



return res.json({

 success:true,

 message:
  "Camera updated successfully",

 data:updated,

});



}catch(error){

return handleError(
 res,
 error,
 "Failed to update camera"
);

}

};
/* =========================================================
   DELETE CAMERA (soft delete recommended in future)
========================================================= */
export const deleteCamera = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    await prisma.camera.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Camera deleted successfully",
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete camera");
  }
};

/* =========================================================
   TOGGLE STATUS (ONLINE / OFFLINE CONTROL)
========================================================= */
export const toggleCameraStatus = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;    const { isActive } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        isActive,
      },
    });

    return res.json({
      success: true,
      message: "Camera status updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to toggle camera status");
  }
};

/* =========================================================
   TOGGLE AI

   Rule:
   - Only one AI camera allowed per station
========================================================= */

export const toggleCameraAI = async (
  req: Request,
  res: Response
) => {

  try {

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;


    const { aiEnabled } = req.body;


    if (typeof aiEnabled !== "boolean") {

      return res.status(400).json({
        success:false,
        message:"aiEnabled must be boolean",
      });

    }



    const camera =
      await prisma.camera.findUnique({
        where:{
          id
        },
        select:{
          id:true,
          stationId:true,
        }
      });



    if(!camera){

      return res.status(404).json({
        success:false,
        message:"Camera not found",
      });

    }



    const result =
      await prisma.$transaction(
        async (tx)=>{


          /*
            Enabling AI:
            Disable all other cameras
            in same station
          */

          if(aiEnabled){


            await tx.camera.updateMany({

              where:{
                stationId:camera.stationId,

                id:{
                  not:id
                },

                aiEnabled:true,
              },

              data:{
                aiEnabled:false,
              }

            });


          }



          /*
            Update selected camera
          */

          const updated =
            await tx.camera.update({

              where:{
                id
              },

              data:{
                aiEnabled
              }

            });


          return updated;

        }
      );



    return res.json({

      success:true,

      message:
        aiEnabled
          ? "AI enabled. Other station cameras disabled."
          : "AI disabled.",

      data:result,

    });



  } catch(error){

    return handleError(
      res,
      error,
      "Failed to toggle AI"
    );

  }

};


/* =========================================================
   REAL CAMERA STREAM TEST (PRODUCTION + RELIABLE + SAFE)
========================================================= */
import dns from "dns";
import { fetchWithDigestAuth } from "../../utils/digestAuth"; // adjust to wherever you saved it
import { CameraStatus, Prisma } from "@prisma/client";
import { decrypt, encrypt } from "../../utils/crypto";

dns.setDefaultResultOrder("ipv4first");

// Strip any embedded credentials before this URL is logged or sent
// back in an API response — streamUrl should never leak a password.
function redactCredentials(url: string) {
  return url.replace(/:\/\/[^@/]+@/, "://***:***@");
}

export const testCameraStream = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const camera = await prisma.camera.findUnique({ where: { id } });

    if (!camera) {
      return res.status(404).json({ success: false, message: "Camera not found" });
    }

    let password = "";
    if (camera.passwordEncrypted) {
      password = decrypt(camera.passwordEncrypted);
    }

    const protocol = camera.protocol.toLowerCase();

    // No credentials embedded here — auth is applied per authType,
    // per protocol, below. This is also the URL that gets logged /
    // returned to the client.
    const baseUrl = `${protocol}://${camera.host}:${camera.port}${camera.path}`;

    const start = Date.now();

    let isOnline = false;
    let errorMessage: string | null = null;
    let errorCode: string | null = null;
    let method = "unknown";

    const isHttpStream = camera.protocol === "HTTP" || camera.protocol === "HTTPS";

    const isMjpeg =
      camera.path.includes("mjpeg") ||
      camera.path.includes("multipart") ||
      camera.path.includes("/video");

    /* =========================================
       HTTP MJPEG
    ========================================= */
    if (isHttpStream && isMjpeg) {
      method = "http-mjpeg";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        let response: globalThis.Response;

        switch (camera.authType) {
          case "DIGEST":
            if (!camera.username || !password) {
              throw new Error("DIGEST auth configured but username/password missing");
            }
            response = await fetchWithDigestAuth(
              baseUrl,
              camera.username,
              password,
              controller.signal
            );
            break;

          case "BASIC": {
            if (!camera.username || !password) {
              throw new Error("BASIC auth configured but username/password missing");
            }
            const basicUrl = baseUrl.replace(
              "://",
              `://${camera.username}:${password}@`
            );
            response = await fetch(basicUrl, {
              method: "GET",
              signal: controller.signal,
            });
            break;
          }

          case "NONE":
          default:
            response = await fetch(baseUrl, {
              method: "GET",
              signal: controller.signal,
            });
            break;
        }

        if (!response.ok || !response.body) {
          throw new Error(`HTTP_${response.status}`);
        }

        const reader = response.body.getReader();

        const result = await Promise.race([
          reader.read(),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("STREAM_TIMEOUT")), 4000)
          ),
        ]);

        isOnline = !result.done && !!result.value && result.value.length > 0;

        reader.releaseLock();

        if (!isOnline) {
          errorCode = "EMPTY_STREAM";
          errorMessage = "Connected but no frame received";
        }
      } catch (err: any) {
        errorCode = err?.cause?.code || err?.code || "HTTP_FAILED";
        errorMessage = err.message;
      } finally {
        clearTimeout(timeout);
      }
    }

    /* =========================================
       RTSP / OTHER VIDEO
       ffmpeg negotiates Basic/Digest itself when
       credentials are embedded in the URL, so no
       manual handshake is needed on this path.
    ========================================= */
    else {
      method = "ffprobe";

      const ffprobeUrl =
        camera.authType !== "NONE" && camera.username && password
          ? baseUrl.replace("://", `://${camera.username}:${password}@`)
          : baseUrl;

      isOnline = await new Promise<boolean>((resolve) => {
        let finished = false;

        const timeout = setTimeout(() => {
          if (!finished) {
            finished = true;
            errorCode = "TIMEOUT";
            errorMessage = "ffprobe timeout";
            resolve(false);
          }
        }, 8000);

        ffmpeg.ffprobe(ffprobeUrl, (err) => {
          if (finished) return;

          clearTimeout(timeout);
          finished = true;

          if (err) {
            errorCode = err.message.includes("ECONNREFUSED")
              ? "CONNECTION_REFUSED"
              : err.message.includes("ETIMEDOUT")
              ? "TIMEOUT"
              : "PROBE_FAILED";

            errorMessage = err.message;

            return resolve(false);
          }

          return resolve(true);
        });
      });
    }

    const latencyMs = Date.now() - start;

    await prisma.camera.update({
      where: { id },
      data: {
        status: isOnline ? CameraStatus.online : CameraStatus.offline,
        lastCheckedAt: new Date(),
        ...(isOnline && { lastSeenAt: new Date() }),
      },
    });

    return res.json({
      success: true,
      message: isOnline ? "Camera stream is online" : "Camera stream is offline",
      data: {
        id: camera.id,
        cameraName: camera.name,
        status: isOnline ? CameraStatus.online : CameraStatus.offline,
        latencyMs,
        method,
        streamUrl: redactCredentials(baseUrl),
        error: isOnline ? null : errorMessage,
        errorCode: isOnline ? null : errorCode,
        testedAt: new Date(),
      },
    });
  } catch (error) {
    return handleError(res, error, "Failed to test camera stream");
  }
};


/* =========================================================
   UPDATE NETWORK CONFIG
========================================================= */
export const updateCameraNetwork = async (req: Request, res: Response) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
        
    const { ipAddress, port } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        ipAddress,
        port,
      },
    });

    return res.json({
      success: true,
      message: "Network settings updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update network config");
  }
};

/* =========================================================
   UPDATE STREAM CONFIG (AI TUNING)
========================================================= */
export const updateCameraStreamConfig = async (
  req: Request,
  res: Response
) => {
  try {
  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;    const { fps, codec, resolution } = req.body;

    const updated = await prisma.camera.update({
      where: { id },
      data: {
        fps,
        codec,
        resolution,
      },
    });

    return res.json({
      success: true,
      message: "Stream config updated",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update stream config");
  }
};


/* =========================================================
   GET AI ENABLED CAMERAS (OPTIONAL STATION FILTER)
========================================================= */

export const getAiEnabledCamerasByStation = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.query;

    const cameras = await prisma.camera.findMany({
      where: {
        aiEnabled: true,
        ...(stationId ? { stationId: String(stationId) } : {}),
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "AI-enabled cameras fetched successfully",
      data: cameras,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch AI cameras");
  }
};

export const getStationAiCameras = async (
  req: Request,
  res: Response
) => {

  try {

    const rawStationId = req.params.stationId;


    const stationId =
      typeof rawStationId === "string"
        ? rawStationId
        : rawStationId?.[0];


    if (!stationId) {

      return res.status(400).json({

        success:false,

        message:"stationId is required"

      });

    }



    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;



    const status =
      typeof req.query.status === "string"
        ? req.query.status as CameraStatus
        : undefined;



    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;



    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 20;



    const skip =
      (page - 1) * limit;




    const where: Prisma.CameraWhereInput = {

      stationId,

      aiEnabled:true,


      ...(status && {
        status
      }),



      ...(search && {

        OR:[

          {
            name:{
              contains:search,
              mode:"insensitive"
            }
          },

          {
            location:{
              contains:search,
              mode:"insensitive"
            }
          },

          {
            host:{
              contains:search,
              mode:"insensitive"
            }
          }

        ]

      })

    };






    const [
      stationSetting,
      cameras,
      total

    ] = await Promise.all([



      // =========================
      // STATION AI CONFIG
      // =========================

      prisma.stationSetting.findUnique({

        where:{
          stationId
        },

        select:{

          queueZone:true,

          thresholdLow:true,

          thresholdMedium:true,

          thresholdHigh:true,

          thresholdCritical:true,

          maxQueueCapacity:true,

          minFuelRequestLiters:true

        }

      }),





      // =========================
      // AI CAMERAS
      // =========================

      prisma.camera.findMany({

        where,


        skip,

        take:limit,


        orderBy:{
          createdAt:"desc"
        },



        select:{


          id:true,


          stationId:true,


          name:true,



          // CONNECTION

          protocol:true,

          host:true,

          port:true,

          path:true,

          authType:true,



          // STATUS

          status:true,

          isActive:true,



          // AI

          aiEnabled:true,



          // LOCATION

          location:true,

          latitude:true,

          longitude:true,



          // STREAM

          resolution:true,

          fps:true,

          codec:true,



          lastCheckedAt:true,

          lastSeenAt:true,


          createdAt:true,

          updatedAt:true

        }

      }),




      prisma.camera.count({

        where

      })



    ]);






    return res.status(200).json({

      success:true,

      message:"Station AI cameras loaded successfully",



      data:{

        queueZone:
            stationSetting?.queueZone ?? null,
        cameras


      },



      meta:{

        total,

        page,

        limit,

        totalPages:
          Math.ceil(total / limit)

      }


    });



  }
  catch(error){

    return handleError(
      res,
      error,
      "Failed to load station AI cameras"
    );

  }

};
export const updateQueueZone = async (req: Request, res: Response) => {
  try {
    console.log("📥 [QUEUE ZONE REQUEST RECEIVED]");
    console.log("params.stationId:", req.params.stationId);
    console.log("body:", JSON.stringify(req.body, null, 2));

    const rawStationId = req.params.stationId;

    const stationId =
      typeof rawStationId === "string" ? rawStationId : rawStationId?.[0];

    console.log("🧾 parsed stationId:", stationId);

    if (!stationId) {
      console.log("❌ Missing stationId");
      return res.status(400).json({
        success: false,
        message: "stationId is required",
      });
    }

    const queueZone = req.body?.queueZone;

    console.log("📦 queueZone raw:", queueZone);

    // STRICT validation
    if (
      !queueZone ||
      typeof queueZone.x !== "number" ||
      typeof queueZone.y !== "number" ||
      typeof queueZone.width !== "number" ||
      typeof queueZone.height !== "number"
    ) {
      console.log("❌ Invalid queueZone payload detected");
      console.log("queueZone type:", typeof queueZone);
      console.log("queueZone value:", queueZone);

      return res.status(400).json({
        success: false,
        message: "Invalid queueZone payload",
      });
    }

    const cleanQueueZone = {
      x: Number(queueZone.x),
      y: Number(queueZone.y),
      width: Number(queueZone.width),
      height: Number(queueZone.height),
    };

    console.log("🚀 BEFORE UPSERT");
    console.log("stationId:", stationId);
    console.log("queueZone:", cleanQueueZone);

    const existing = await prisma.stationSetting.findUnique({
      where: { stationId },
    });

    console.log("🔍 existing setting:", existing);

    const updated = await prisma.stationSetting.upsert({
      where: { stationId },
      create: {
        stationId,
        queueZone: cleanQueueZone,
        thresholdLow: 10,
        thresholdMedium: 20,
        thresholdHigh: 30,
        thresholdCritical: 40,
        maxQueueCapacity: 50,
        minFuelRequestLiters: 1,
      },
      update: {
        queueZone: cleanQueueZone,
      },
    });

    console.log("✅ DB update success:", updated);

    return res.status(200).json({
      success: true,
      message: "Queue zone updated successfully",
      data: updated.queueZone,
    });
  } catch (error: any) {
    console.error("🔥 QUEUE ZONE ERROR CAUGHT");
    console.error("name:", error?.name);
    console.error("message:", error?.message);
    console.error("stack:", error?.stack);

    return res.status(500).json({
      success: false,
      message: "Failed to update queue zone",
      error: {
        name: error?.name,
        message: error?.message,
      },
    });
  }
};


/* =========================================================
   STREAM PROXY (video passthrough)

   - HTTP/MJPEG:
     Fetches camera stream server-side using Basic Auth header
     and pipes MJPEG to browser.

   - RTSP:
     Uses ffmpeg to transcode RTSP into MJPEG.

   Credentials never reach the browser.
========================================================= */
export const streamCameraProxy = async (
  req: Request,
  res: Response
) => {

  const id = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;


  let clientClosed = false;


  req.on("close", () => {
    clientClosed = true;
  });


  try {

    const camera =
      await prisma.camera.findUnique({
        where:{
          id
        }
      });


    if (!camera) {

      return res.status(404).json({
        success:false,
        message:"Camera not found",
      });

    }


    if (!camera.isActive) {

      return res.status(409).json({
        success:false,
        message:"Camera is disabled",
      });

    }



    /* -----------------------------
       DECRYPT CAMERA PASSWORD
    ------------------------------ */

    let password = "";

    if (camera.passwordEncrypted) {
      password =
        decrypt(camera.passwordEncrypted);
    }



    const protocol =
      camera.protocol.toLowerCase();



    /*
      Clean URL without credentials.

      Example:
      http://192.168.1.100:8080/video

      NOT:
      http://user:pass@192.168.1.100/video
    */
    const streamUrl =
      `${protocol}://${camera.host}:${camera.port}${camera.path}`;



    const isHttpStream =
      protocol === "http" ||
      protocol === "https";



    const isMjpeg =
      camera.path.toLowerCase().includes("mjpeg") ||
      camera.path.toLowerCase().includes("multipart") ||
      camera.path.toLowerCase().includes("/video");



    /*
      HTTP CAMERA AUTH HEADER

      Converts:

      username:password

      into:

      Authorization:
      Basic base64(username:password)
    */

    const headers: Record<string,string> = {};


    if (
      camera.username &&
      password
    ) {

      headers.Authorization =
        `Basic ${
          Buffer
            .from(
              `${camera.username}:${password}`
            )
            .toString("base64")
        }`;

    }




    /* =================================================
       HTTP MJPEG STREAM
    ================================================= */

    if (
      isHttpStream &&
      isMjpeg
    ) {


      const upstream =
        await fetch(
          streamUrl,
          {
            headers,
          }
        );



      if (
        !upstream.ok ||
        !upstream.body
      ) {

        return res.status(502).json({

          success:false,

          message:
            "Camera did not return a stream",

        });

      }



      res.setHeader(
        "Content-Type",
        upstream.headers.get(
          "content-type"
        )
        ??
        "multipart/x-mixed-replace"
      );


      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );


      res.setHeader(
        "Connection",
        "keep-alive"
      );



      const reader =
        upstream.body.getReader();



      try {


        while(!clientClosed) {


          const {
            done,
            value

          } =
          await reader.read();



          if(done)
            break;



          res.write(value);

        }


      } finally {


        reader.releaseLock();


        if(!res.writableEnded){
          res.end();
        }

      }



      return;

    }




    /* =================================================
       RTSP CAMERA -> FFMPEG -> MJPEG
    ================================================= */


    /*
      RTSP keeps credentials because ffmpeg accepts:

      rtsp://user:password@host/path
    */

    let ffmpegUrl = streamUrl;


    if (
      protocol === "rtsp" &&
      camera.username &&
      password
    ) {

      ffmpegUrl =
        `rtsp://${camera.username}:${password}` +
        `@${camera.host}:${camera.port}${camera.path}`;

    }



    res.setHeader(
      "Content-Type",
      "multipart/x-mixed-replace; boundary=ffmpeg"
    );


    res.setHeader(
      "Cache-Control",
      "no-store"
    );



    const command =
      ffmpeg(ffmpegUrl)

      .inputOptions(
        protocol === "rtsp"
          ? [
              "-rtsp_transport",
              "tcp"
            ]
          : []
      )


      .outputOptions([

        "-c:v",
        "mjpeg",

        "-f",
        "mpjpeg",

        "-q:v",
        "5",

        "-r",
        "10",

      ])


      .on(
        "error",
        (err)=>{


          if(clientClosed)
            return;



          console.error(
            "Camera stream proxy ffmpeg error:",
            err.message
          );



          if(!res.headersSent){

            res.status(502).json({

              success:false,

              message:
                "Failed to open camera stream",

            });

          } else {

            res.end();

          }


        }
      );



    req.on(
      "close",
      ()=>{

        command.kill(
          "SIGKILL"
        );

      }
    );



    command.pipe(
      res,
      {
        end:true
      }
    );



  } catch(error) {


    console.error(
      "Camera Controller Error:",
      error
    );


    if(!res.headersSent){

      return handleError(
        res,
        error,
        "Failed to proxy camera stream"
      );

    }


    res.end();

  }

};