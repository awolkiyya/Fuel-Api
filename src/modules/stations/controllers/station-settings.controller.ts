import { Request, Response } from "express";
import prisma from "../../../config/db";


// ======================================
// GET STATION SETTINGS + GLOBAL LIMITS
// ======================================

export async function getStationSettings(
    req: Request,
    res: Response
) {

    const stationId = req.params.id;


    if (!stationId || Array.isArray(stationId)) {

        return res.status(400).json({
            success:false,
            message:"Invalid station id"
        });

    }



    // ==============================
    // GET GLOBAL SYSTEM SETTINGS
    // ==============================

    const systemSettings =
    await prisma.systemSettings.findUnique({

        where:{
            id:"global"
        }

    });




    // ==============================
    // GET STATION SETTINGS
    // ==============================

    let settings =
    await prisma.stationSetting.findUnique({

        where:{
            stationId
        }

    });





    // ==============================
    // CREATE DEFAULT SETTINGS
    // BASED ON GLOBAL VALUES
    // ==============================

    if(!settings){


        settings =
        await prisma.stationSetting.create({

            data:{


                stationId,


                // AI queue detection zone

                queueZone:{},



                // Station traffic thresholds
                // initialized from global rules

                thresholdLow:
                systemSettings?.maxTrafficLow ?? 20,


                thresholdMedium:
                systemSettings?.maxTrafficMedium ?? 50,


                thresholdHigh:
                systemSettings?.maxTrafficHigh ?? 80,


                thresholdCritical:
                systemSettings?.maxTrafficCritical ?? 100,



                // Station capacity

                maxQueueCapacity:
                systemSettings?.maxQueueCapacityGlobal ?? 100,



                // Fuel request rule

                minFuelRequestLiters:1

            }

        });

    }





    return res.json({

        success:true,


        data:{


            settings,



            limits:{

                maxTrafficLow:
                systemSettings?.maxTrafficLow ?? 20,


                maxTrafficMedium:
                systemSettings?.maxTrafficMedium ?? 50,


                maxTrafficHigh:
                systemSettings?.maxTrafficHigh ?? 80,


                maxTrafficCritical:
                systemSettings?.maxTrafficCritical ?? 100,


                maxQueueCapacity:
                systemSettings?.maxQueueCapacityGlobal ?? 100

            }

        }

    });

}










// ======================================
// UPDATE STATION TRAFFIC SETTINGS
// ======================================

export async function updateQueueSettings(
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




    const {

        thresholdLow,

        thresholdMedium,

        thresholdHigh,

        thresholdCritical,

        maxQueueCapacity,

        queueZone,

        minFuelRequestLiters


    } = req.body;





    // ==============================
    // GET GLOBAL LIMITS
    // ==============================

    const systemSettings =
    await prisma.systemSettings.findUnique({

        where:{
            id:"global"
        }

    });





    if(systemSettings){



        if(
            thresholdLow >
            systemSettings.maxTrafficLow
        ){

            return res.status(400).json({

                success:false,

                message:
                `Low threshold cannot exceed ${systemSettings.maxTrafficLow}`

            });

        }



        if(
            thresholdMedium >
            systemSettings.maxTrafficMedium
        ){

            return res.status(400).json({

                success:false,

                message:
                `Medium threshold cannot exceed ${systemSettings.maxTrafficMedium}`

            });

        }




        if(
            thresholdHigh >
            systemSettings.maxTrafficHigh
        ){

            return res.status(400).json({

                success:false,

                message:
                `High threshold cannot exceed ${systemSettings.maxTrafficHigh}`

            });

        }




        if(
            thresholdCritical >
            systemSettings.maxTrafficCritical
        ){

            return res.status(400).json({

                success:false,

                message:
                `Critical threshold cannot exceed ${systemSettings.maxTrafficCritical}`

            });

        }



        if(
            maxQueueCapacity >
            systemSettings.maxQueueCapacityGlobal
        ){

            return res.status(400).json({

                success:false,

                message:
                `Queue capacity cannot exceed ${systemSettings.maxQueueCapacityGlobal}`

            });

        }


    }







    const updated =
    await prisma.stationSetting.upsert({

        where:{
            stationId
        },



        update:{


            thresholdLow,


            thresholdMedium,


            thresholdHigh,


            thresholdCritical,


            maxQueueCapacity,


            queueZone,


            minFuelRequestLiters


        },



        create:{


            stationId,


            queueZone:
            queueZone ?? {},



            thresholdLow:
            thresholdLow ?? systemSettings?.maxTrafficLow ?? 20,



            thresholdMedium:
            thresholdMedium ?? systemSettings?.maxTrafficMedium ?? 50,



            thresholdHigh:
            thresholdHigh ?? systemSettings?.maxTrafficHigh ?? 80,



            thresholdCritical:
            thresholdCritical ?? systemSettings?.maxTrafficCritical ?? 100,



            maxQueueCapacity:
            maxQueueCapacity ?? systemSettings?.maxQueueCapacityGlobal ?? 100,



            minFuelRequestLiters:
            minFuelRequestLiters ?? 1

        }

    });







    return res.json({

        success:true,

        data:updated

    });

}