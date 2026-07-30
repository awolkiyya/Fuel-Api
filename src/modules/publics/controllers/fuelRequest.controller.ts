import { Request, Response } from "express";
import prisma from "../../../config/db";
import { normalizeParam } from "../../../utils/nortmilizer";
import { getSystemSettings } from "../../../utils/getSystemSettings";
import { resolveFuelPrice } from "../../../rules/pricing.rules";
import { createFuelRequestSchema } from "../../../schemas/fuelRequests.schema";
import { calculateDistance, Coordinates } from "../../../utils/distance";
import { fuelRequestService } from "../../fuelRequests/fuelRequests.service";

/**
 * =====================================================
 * CREATE FUEL REQUEST (CONTROLLER - THIN LAYER)
 * =====================================================
 */
export const createFuelRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Validate payload
    const payload = createFuelRequestSchema.parse(req.body);

    // 2. Build coordinates
    const userCoords: Coordinates = {
      lat: Number(payload.lat),
      lng: Number(payload.long),
    };

    // 3. Delegate distance calculation dependency (station fetched inside service OR here is ok, but better service)
    const distanceKm = await fuelRequestService.calculateDistanceToStation(
      payload.stationId,
      userCoords
    );

    // 4. Call service (ALL BUSINESS LOGIC INSIDE)
    const result = await fuelRequestService.createRequest(
      userId,
      payload,
      distanceKm
    );

    return res.status(201).json({
      success: true,
      message: "Fuel request processed",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to process fuel request",
    });
  }
};



import { FuelRequestStatus } from "@prisma/client";

/**
 * =====================================================
 * GET MY FUEL REQUESTS (PRODUCTION READY)
 * =====================================================
 */
export const getMyFuelRequests = async (
  req: Request,
  res: Response
) => {

  const startTime = Date.now();

  try {

    console.log("==============================");
    console.log("🚀 GET MY FUEL REQUESTS START");
    console.log("==============================");


    const userId = (req as any).user?.id;


    console.log("👤 User ID:", userId);


    if (!userId) {

      console.log("❌ Unauthorized request");

      return res.status(401).json({
        success:false,
        message:"Unauthorized",
      });

    }



    // =========================
    // 📄 PAGINATION
    // =========================

    const page = Math.max(
      1,
      parseInt(req.query.page as string) || 1
    );


    const limit = Math.min(
      50,
      parseInt(req.query.limit as string) || 10
    );


    const skip =
      (page - 1) * limit;



    console.log(
      "📄 Pagination:",
      {
        page,
        limit,
        skip,
      }
    );





    // =========================
    // 🔍 SEARCH
    // =========================

    const search =
      (req.query.search as string)?.trim();



    console.log(
      "🔍 Search:",
      search || "none"
    );





    // =========================
    // 🎯 STATUS FILTER
    // =========================

    const statusParam =
      req.query.status as string;



    let status:
      FuelRequestStatus | undefined;



    if(statusParam){

      const normalized =
        statusParam.toUpperCase();



      if(
        Object.values(
          FuelRequestStatus
        ).includes(
          normalized as FuelRequestStatus
        )
      ){

        status =
          normalized as FuelRequestStatus;


      }else{


        console.log(
          "❌ Invalid status:",
          statusParam
        );


        return res.status(400).json({

          success:false,

          message:
          `Invalid fuel request status: ${statusParam}`,

        });


      }

    }



    console.log(
      "🎯 Status filter:",
      status || "none"
    );







    // =========================
    // ↕️ SORT
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
      "requestedLiters",
      "status",
    ];



    const orderByField =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";



    console.log(
      "↕️ Sorting:",
      {
        field:orderByField,
        direction,
      }
    );







    // =========================
    // 🧩 WHERE CLAUSE
    // =========================

    const whereClause:any = {

      userId,

    };



    if(status){

      whereClause.status = status;

    }



    if(search){


      whereClause.OR = [

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
          vehicle:{
            fuelType:{
              name:{
                contains:search,
                mode:"insensitive",
              },
            },
          },
        },


        {
          station:{
            name:{
              contains:search,
              mode:"insensitive",
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
      "🧩 Where Clause:",
      JSON.stringify(
        whereClause,
        null,
        2
      )
    );







    // =========================
    // ⚙️ SYSTEM SETTINGS
    // =========================


    console.log(
      "⚙️ Loading system settings..."
    );


    const settings =
      await getSystemSettings(prisma);



    console.log(
      "✅ Settings loaded"
    );







    // =========================
    // 📦 DATABASE QUERY
    // =========================


    console.log(
      "📦 Fetching fuel requests..."
    );


    const queryStart =
      Date.now();



    const [
      requests,
      total
    ] = await Promise.all([



      prisma.fuelRequest.findMany({

        where:whereClause,


        include:{


          vehicle:{

            include:{

              vehicleType:true,

              fuelType:true,

            },

          },


          station:true,


          fuelType:true,


        },


        orderBy:{

          [orderByField]:
          direction,

        },


        skip,

        take:limit,


      }),



      prisma.fuelRequest.count({

        where:whereClause,

      }),


    ]);





    console.log(
      "✅ Database query completed",
      {
        records:requests.length,
        total,
        duration:
        `${Date.now()-queryStart}ms`,
      }
    );









    // =========================
    // ⛽ STATION PRICES
    // =========================


    const stationIds = [
      ...new Set(
        requests.map(
          r=>r.station.id
        )
      ),
    ];



    console.log(
      "⛽ Station IDs:",
      stationIds
    );



    const stationPrices =
      stationIds.length > 0

      ?

      await prisma.stationFuelPrice.findMany({

        where:{

          stationId:{

            in:stationIds,

          },

        },

      })

      :

      [];




    console.log(
      "💰 Station prices loaded:",
      stationPrices.length
    );









    // =========================
    // 🧠 FORMAT RESPONSE
    // =========================


    console.log(
      "🧠 Formatting response..."
    );



    const data =
      requests.map((r)=>{


        const stationPrice =
          stationPrices.find(

            p=>

            p.stationId === r.station.id
            &&

            p.fuelTypeId === r.fuelType.id

          );



        const pricePerLiter =
          resolveFuelPrice(

            r.fuelType,


            stationPrice

            ?

            {

              fuelTypeId:
              stationPrice.fuelTypeId,


              pricePerLiter:
              stationPrice.pricePerLiter,


              isOverride:
              stationPrice.isOverride,

            }


            :

            {

              fuelTypeId:
              r.fuelType.id,


              pricePerLiter:
              r.fuelType.price,


              isOverride:false,

            },


            settings

          );





        const totalPrice =
          r.requestedLiters *
          pricePerLiter;





        return {


          id:r.id,



          vehicle:{

            id:r.vehicle.id,

            plateNumber:
            r.vehicle.plateNumber,


            name:
            r.vehicle.vehicleType.name,


            fuelType:
            r.vehicle.fuelType.name,

          },



          station:{

            id:r.station.id,

            name:r.station.name,

          },



          request:{

            requestedLiters:
            r.requestedLiters,


            pricePerLiter,


            totalPrice,


            // lowercase for Flutter
            status:
            r.status.toLowerCase(),

          },



          dateTime:
          r.createdAt,


        };


      });






    console.log(
      "✅ Response formatted",
      {
        count:data.length,
      }
    );






    console.log(
      "🏁 GET MY FUEL REQUESTS END",
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
    
    
    
      summary:{
    
        filters:{
    
          search:
          search || null,
    
    
          status:
          status
            ? status.toLowerCase()
            : null,
    
    
          sortBy:
          orderByField,
    
    
          direction,
    
        },
    
      },
    
    
    });




  } catch(error:any){



    console.error(
      "🔥 GET MY FUEL REQUESTS ERROR",
      {
        message:error.message,
        stack:error.stack,
      }
    );



    return res.status(500).json({

      success:false,

      message:
      error.message ||
      "Failed to fetch fuel requests",

    });


  }

};



/**
 * =====================================================
 * GET ACTIVE FUEL REQUEST ONLY
 * =====================================================
 */
export const getMyActiveFuelRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activeRequests = await prisma.fuelRequest.findMany({
      where: {
        userId,
        status: {
          in: ["PENDING", "APPROVED","VERIFIED"],
        },
      },
      include: {
        vehicle: true,
        station: true,
        fuelType: true,
        assignedTo: true,
        nozzle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: activeRequests, // always array
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active requests",
    });
  }
};


/**
 * =====================================================
 * GET FUEL REQUEST BY ID
 * =====================================================
 */
export const getFuelRequestById = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user?.id;
    const id = normalizeParam(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const request = await prisma.fuelRequest.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        vehicle: {
          include: {
            fuelType: true,
          },
        },
        station: true,
        fuelType: true,
        assignedTo: true,
        nozzle: true,
        rejectionReason: true,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Fuel request not found",
      });
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get fuel request",
    });
  }
};


export const cancelFuelRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const id = normalizeParam(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("CANCEL REQUEST ID:", id);
    console.log("USER ID:", userId);

    /**
     * 1. Fetch request first (more reliable than updateMany)
     */
    const request = await prisma.fuelRequest.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Fuel request not found",
      });
    }

    /**
     * 2. Validate status explicitly (better debugging)
     */
    if (request.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request in '${request.status}' state`,
      });
    }

    /**
     * 3. Perform update
     */
    const updated = await prisma.fuelRequest.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "Fuel request cancelled successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("cancelFuelRequest error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel fuel request",
    });
  }
};