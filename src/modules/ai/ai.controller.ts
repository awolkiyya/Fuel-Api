import { Request, Response } from "express";
import prisma from "../../config/db";




// =====================================
// GET ACTIVE STATIONS
// =====================================


export async function getActiveStations(
    req:Request,
    res:Response
){

    const stations = await prisma.station.findMany({

        where:{
            status:"ACTIVE"
        },

        select:{

            id:true,

            name:true

        }

    });


    res.json({

        success:true,

        data:stations

    });

}





// =====================================
// FULL AI CONFIG
// =====================================


// =====================================
// FULL AI CONFIG
// =====================================

export async function getStationConfig(
    req: Request<{ stationId: string }>,
    res: Response
) {

    const { stationId } = req.params;


    const station = await prisma.station.findUnique({

        where:{
            id: stationId
        },

        include:{

            cameras:true,

            settings:true

        }

    });



    if(!station){

        return res.status(404).json({

            success:false,

            message:"Station not found"

        });

    }



    const config = station.settings;



    return res.json({

        success:true,

        data:{

            id:station.id,


            camera:station.cameras,


            ai_config:{

                queue_zone:
                    config?.queueZone
                    ??
                    {
                        x1:100,
                        y1:200,
                        x2:800,
                        y2:600
                    },


                thresholds:{

                    LOW:
                        config?.thresholdLow
                        ??
                        3,


                    MEDIUM:
                        config?.thresholdMedium
                        ??
                        7,


                    HIGH:
                        config?.thresholdHigh
                        ??
                        10,


                    CRITICAL:
                        config?.thresholdCritical
                        ??
                        15

                },


                max_queue_capacity:
                    config?.maxQueueCapacity
                    ??
                    20,


                min_fuel_request_liters:
                    config?.minFuelRequestLiters
                    ??
                    1

            }

        }

    });

}





// =====================================
// CAMERA ONLY
// =====================================

export async function getStationCamera(
    req: Request<{ stationId: string }>,
    res: Response
) {

    const { stationId } = req.params;


    const camera =
        await prisma.camera.findFirst({

            where:{
                stationId
            }

        });



    return res.json({

        success:true,

        data:camera

    });

}




// =====================================
// RECEIVE AI RESULT
// =====================================


export async function updateAIResult(
    req: Request,
    res: Response
) {

    const data = req.body;


    console.log(
        "AI RESULT",
        data
    );


    const result = await prisma.stationTraffic.upsert({

        where:{
            stationId:data.stationId
        },


        update:{

            queueCount:
                data.queueCount,


            congestionLevel:
                data.congestionLevel,


            waitingTimeMin:
                data.waitingTimeMin,


            confidenceScore:
                data.confidenceScore ?? null,


            updatedBy:"ai"

        },


        create:{

            stationId:
                data.stationId,


            queueCount:
                data.queueCount,


            congestionLevel:
                data.congestionLevel,


            waitingTimeMin:
                data.waitingTimeMin,


            confidenceScore:
                data.confidenceScore ?? null,


            updatedBy:"ai"

        }

    });



    return res.json({

        success:true,

        data:result

    });

}




// =====================================
// HEARTBEAT
// =====================================


// =====================================
// CAMERA AI HEARTBEAT
// =====================================

export async function heartbeat(
    req: Request,
    res: Response
) {

    const {
        cameraId,
        status
    } = req.body;



    const camera = await prisma.camera.update({

        where:{
            id:cameraId
        },


        data:{

            status,

            lastSeenAt:new Date(),

            lastCheckedAt:new Date()

        }

    });



    return res.json({

        success:true,

        data:{
            cameraId:camera.id,
            status:camera.status,
            lastSeenAt:camera.lastSeenAt
        }

    });

}