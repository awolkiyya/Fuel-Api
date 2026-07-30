import { Request, Response } from "express";
import { Prisma, PaymentStatus } from "@prisma/client";

import prisma from "../../../config/db";



/**
 * =====================================================
 * GET MY FUEL TRANSACTIONS
 * =====================================================
 */
export const getMyFuelTransactions = async (
  req: Request,
  res: Response
) => {

  const startTime = Date.now();


  try {

    console.log("======================================");
    console.log("🚀 GET MY FUEL TRANSACTIONS START");
    console.log("======================================");


    const userId = (req as any).user?.id;


    console.log("👤 User:", userId);



    if (!userId) {

      return res.status(401).json({
        success:false,
        message:"Unauthorized",
      });

    }




    // =========================
    // PAGINATION
    // =========================

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );


    const limit = Math.min(
      50,
      Number(req.query.limit) || 10
    );


    const skip =
      (page - 1) * limit;




    // =========================
    // SEARCH
    // =========================

    const search =
      (req.query.search as string)?.trim();





    // =========================
    // FILTER
    // =========================

    const paymentStatus =
      req.query.paymentStatus as
      PaymentStatus | undefined;



    const stationId =
      req.query.stationId as string | undefined;



    const fuelTypeId =
      req.query.fuelTypeId as string | undefined;






    // =========================
    // SORT
    // =========================

    const sortBy =
      (req.query.sortBy as string)
      || "createdAt";


    const direction =
      req.query.direction === "asc"
        ? "asc"
        : "desc";



    const allowedSortFields = [

      "createdAt",

      "litersGiven",

      "totalCost",

      "pricePerLiter",

    ];



    const orderBy =
      allowedSortFields.includes(sortBy)

        ? sortBy

        : "createdAt";





    // =========================
    // WHERE
    // =========================

    const where:
      Prisma.TransactionWhereInput =
    {

      userId,

    };





    if(paymentStatus){

      where.paymentStatus =
        paymentStatus;

    }




    if(stationId){

      where.stationId =
        stationId;

    }




    if(fuelTypeId){

      where.fuelTypeId =
        fuelTypeId;

    }




    if(search){


      where.OR = [

        {
          station:{
            name:{
              contains:search,
              mode:"insensitive",
            },
          },
        },


        {
          vehicle:{
            plateNumber:{
              contains:search,
              mode:"insensitive",
            },
          },
        },


        {
          vehicle:{
            vehicleType:{
              name:{
                contains:search,
                mode:"insensitive",
              },
            },
          },
        },


        {
          fuelType:{
            name:{
              contains:search,
              mode:"insensitive",
            },
          },
        },

      ];

    }




    console.log(
      "📄 Pagination",
      {
        page,
        limit,
        skip,
      }
    );


    console.log(
      "🧩 Where",
      JSON.stringify(
        where,
        null,
        2
      )
    );





    // =========================
    // DATABASE
    // =========================


    const queryStart =
      Date.now();



    const [
      transactions,
      total
    ] = await Promise.all([



      prisma.transaction.findMany({

        where,


        include:{


          station:true,


          fuelType:true,



          vehicle:{

            include:{

              vehicleType:true,

              fuelType:true,

            },

          },



          attendant:{

            select:{

              id:true,

              firstName:true,

              lastName:true,

            },

          },



          nozzle:{

            select:{

              id:true,

              name:true,

            },

          },



          fuelRequest:{

            select:{

              id:true,

              requestedLiters:true,

              approvedLiters:true,

              dispensedLiters:true,

              status:true,

            },

          },


        },


        orderBy:{

          [orderBy]:
          direction,

        },


        skip,

        take:limit,


      }),





      prisma.transaction.count({

        where,

      }),



    ]);




    console.log(
      "✅ Query completed",
      {

        records:
        transactions.length,

        total,

        duration:
        `${Date.now()-queryStart}ms`,

      }
    );







    // =========================
    // FORMAT RESPONSE
    // =========================


    const data =
      transactions.map((t)=>{


        return {

          id:t.id,


          type:t.type,



          paymentStatus:
          t.paymentStatus,



          litersGiven:
          t.litersGiven,



          pricePerLiter:
          t.pricePerLiter,



          totalCost:
          t.totalCost,



          createdAt:
          t.createdAt,



          station:{

            id:t.station.id,

            name:t.station.name,

          },



          fuelType:{

            id:t.fuelType.id,

            name:t.fuelType.name,

          },



          vehicle:
          t.vehicle

          ?

          {

            id:t.vehicle.id,

            plateNumber:
            t.vehicle.plateNumber,


            name:
            t.vehicle.vehicleType.name,

          }

          :

          null,




          attendant:
          t.attendant

          ?

          {

            id:t.attendant.id,

            name:
            `${t.attendant.firstName} ${t.attendant.lastName}`,

          }

          :

          null,





          nozzle:
          t.nozzle

          ?

          {

            id:t.nozzle.id,

            name:t.nozzle.name,

          }

          :

          null,





          fuelRequest:
          t.fuelRequest

          ?

          {

            id:t.fuelRequest.id,


            requestedLiters:
            t.fuelRequest.requestedLiters,


            approvedLiters:
            t.fuelRequest.approvedLiters,


            dispensedLiters:
            t.fuelRequest.dispensedLiters,


            status:
            t.fuelRequest.status.toLowerCase(),

          }

          :

          null,


        };


      });







    // =========================
    // SUMMARY
    // =========================


    const summary = {


      totalTransactions:
      total,



      totalLiters:
      transactions.reduce(

        (sum,t)=>
        sum + t.litersGiven,

        0

      ),



      totalAmount:
      transactions.reduce(

        (sum,t)=>
        sum + t.totalCost,

        0

      ),



      paidTransactions:
      transactions.filter(

        t=>t.paymentStatus==="PAID"

      ).length,



      unpaidTransactions:
      transactions.filter(

        t=>t.paymentStatus==="UNPAID"

      ).length,



      filters:{

        search:
        search || null,


        paymentStatus:
        paymentStatus || null,


        stationId:
        stationId || null,


        fuelTypeId:
        fuelTypeId || null,


        sortBy:
        orderBy,


        direction,

      },


    };







    console.log(
      "🏁 GET MY FUEL TRANSACTIONS END",
      {
        duration:
        `${Date.now()-startTime}ms`,
      }
    );






    return res.json({

      success:true,


      data,



      meta:{


        page,

        limit,

        total,


        totalPages:
        Math.ceil(
          total / limit
        ),



        hasNext:
        page * limit < total,



        hasPrev:
        page > 1,


      },



      summary,


    });





  } catch(error:any){


    console.error(
      "🔥 GET MY FUEL TRANSACTIONS ERROR",
      {

        message:error.message,

        stack:error.stack,

      }
    );



    return res.status(500).json({

      success:false,

      message:
      error.message ||
      "Failed to load fuel transactions",

    });


  }

};