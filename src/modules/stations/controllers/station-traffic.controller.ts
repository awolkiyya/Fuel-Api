import { Request, Response } from "express";
import prisma from "../../../config/db";



// ======================================
// GET CURRENT TRAFFIC
// ======================================

export async function getStationTraffic(
    req: Request,
    res: Response
){

    const stationId = req.params.id;


    if (!stationId || Array.isArray(stationId)) {
        return res.status(400).json({
            success:false,
            message:"Invalid station id"
        });
    }



    let traffic =
        await prisma.stationTraffic.findUnique({

            where:{
                stationId
            }

        });



    if(!traffic){

        traffic =
        await prisma.stationTraffic.create({

            data:{

                stationId,

                queueCount:0,

                congestionLevel:"low",

                waitingTimeMin:0,

                confidenceScore:null,

                updatedBy:"manual"

            }

        });

    }



    return res.json({

        success:true,

        data:traffic

    });

}








// ======================================
// MANUAL OVERRIDE
// ======================================

export async function updateManualTraffic(
    req:Request,
    res:Response
){

    const stationId = req.params.id;


    if (!stationId || Array.isArray(stationId)) {
        return res.status(400).json({
            success:false,
            message:"Invalid station id"
        });
    }



    const traffic =
    await prisma.stationTraffic.upsert({

        where:{
            stationId
        },


        update:{

            queueCount:
            req.body.queueCount,


            congestionLevel:
            req.body.congestionLevel,


            updatedBy:"manual"

        },


        create:{

            stationId,


            queueCount:
            req.body.queueCount,


            congestionLevel:
            req.body.congestionLevel,


            waitingTimeMin:0,


            confidenceScore:null,


            updatedBy:"manual"

        }

    });



    return res.json({

        success:true,

        data:traffic

    });

}