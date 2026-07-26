import { Request, Response } from "express"

import prisma from "../../../config/db"

import { mapStationTransaction } from "../mappers/station-transaction.mapper"



// ======================================
// GET STATION TRANSACTIONS
// ======================================

export async function getStationTransactions(
    req: Request,
    res: Response
) {

    try {


        const stationId = req.params.id


        const {
            search,
            type,
            fuelTypeId,
            paymentStatus,
            attendantId,
            page = "1",
            limit = "20"

        } = req.query



        const pageNumber = Number(page)

        const limitNumber = Number(limit)


        const skip =
            (pageNumber - 1) * limitNumber





        const where:any = {

            stationId,


            type:
                type
                ? type as any
                : undefined,


            fuelTypeId:
                fuelTypeId
                ? String(fuelTypeId)
                : undefined,


            paymentStatus:
                paymentStatus
                ? paymentStatus as any
                : undefined,


            attendantId:
                attendantId
                ? String(attendantId)
                : undefined,

        }



        if(search){

            where.OR = [

                {
                    user:{
                        name:{
                            contains:String(search),
                            mode:"insensitive"
                        }
                    }
                },


                {
                    organization:{
                        name:{
                            contains:String(search),
                            mode:"insensitive"
                        }
                    }
                },


                {
                    vehicle:{
                        plateNumber:{
                            contains:String(search),
                            mode:"insensitive"
                        }
                    }
                }

            ]

        }





        const [
            transactions,
            total

        ] = await Promise.all([



            prisma.transaction.findMany({

                where,


                include:{


                    station:true,


                    fuelRequest:true,


                    fuelType:true,


                    organization:true,


                    user:true,


                    vehicle:true,


                    nozzle:true,


                    attendant:true


                },


                orderBy:{

                    createdAt:"desc"

                },


                skip,


                take:limitNumber


            }),



            prisma.transaction.count({

                where

            })


        ])





        const data =
    transactions.map(
        mapStationTransaction
    )


return res.status(200).json({

    success:true,

    data,


    meta:{

        page: pageNumber,

        perPage: limitNumber,

        total,

        totalPages:
            Math.ceil(
                total / limitNumber
            )

    }

})



    }

    catch(error){


        console.error(
            "GET STATION TRANSACTIONS ERROR:",
            error
        )



        res.status(500).json({

            success:false,

            message:
                "Failed to load station transactions"

        })


    }

}







// ======================================
// GET SINGLE TRANSACTION
// ======================================

export async function getStationTransactionById(
    req: Request,
    res: Response
) {

    try {


        const id = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id


        const transactionId = Array.isArray(req.params.transactionId)
            ? req.params.transactionId[0]
            : req.params.transactionId



        if(!id || !transactionId){

            return res.status(400).json({

                success:false,

                message:"Invalid station or transaction id"

            })

        }




        const transaction =
            await prisma.transaction.findFirst({

                where:{


                    id: transactionId,


                    stationId: id


                },


                include:{


                    station:true,


                    fuelRequest:true,


                    fuelType:true,


                    organization:true,


                    user:true,


                    vehicle:true,


                    nozzle:true,


                    attendant:true


                }


            })





        if(!transaction){


            return res.status(404).json({

                success:false,

                message:"Transaction not found"

            })


        }





        res.json({

            success:true,

            data:
                mapStationTransaction(transaction)

        })


    }


    catch(error){


        console.error(
            "GET TRANSACTION ERROR:",
            error
        )


        res.status(500).json({

            success:false,

            message:"Failed to load transaction"

        })


    }

}








// ======================================
// GET TRANSACTION SUMMARY
// ======================================

export async function getTransactionSummary(
    req: Request,
    res: Response
) {


    try {


        const stationId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id



        if (!stationId) {

            return res.status(400).json({

                success:false,

                message:"Station id is required"

            })

        }





        const [

            total,

            liters,

            revenue,

            organizationLiters,

            normalLiters

        ] = await Promise.all([




            prisma.transaction.count({

                where:{
                    stationId
                }

            }),




            prisma.transaction.aggregate({

                where:{
                    stationId
                },


                _sum:{

                    litersGiven:true

                }

            }),





            prisma.transaction.aggregate({

                where:{
                    stationId
                },


                _sum:{

                    totalCost:true

                }

            }),





            prisma.transaction.aggregate({

                where:{

                    stationId,

                    type:"ORGANIZATION"

                },


                _sum:{

                    litersGiven:true

                }

            }),





            prisma.transaction.aggregate({

                where:{

                    stationId,

                    type:"NORMAL"

                },


                _sum:{

                    litersGiven:true

                }

            })



        ])







        res.json({

            success:true,


            data:{


                transactions:total,


                liters:
                    liters._sum.litersGiven ?? 0,


                revenue:
                    revenue._sum.totalCost ?? 0,



                organizationLiters:
                    organizationLiters
                    ._sum
                    .litersGiven ?? 0,



                normalLiters:
                    normalLiters
                    ._sum
                    .litersGiven ?? 0


            }

        })



    }


    catch(error){


        console.error(
            "TRANSACTION SUMMARY ERROR:",
            error
        )



        res.status(500).json({

            success:false,

            message:
                "Failed to load transaction summary"

        })


    }

}