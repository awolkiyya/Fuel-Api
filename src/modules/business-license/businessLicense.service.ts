import prisma from "../../config/db";

export class BusinessLicenseService {

  /**
   * =====================================
   * CREATE LICENSE (USER)
   * =====================================
   */
  static async create(
    data: any,
    documentUrl?: string
  ) {

    const existing = await prisma.businessLicense.findUnique({
      where: {
        userId: data.userId,
      },
    });

    if (existing) {
      throw new Error("License already exists for this user");
    }


    return prisma.businessLicense.create({
      data: {

        user: {
          connect: {
            id: data.userId,
          },
        },

        licenseNumber: data.licenseNumber,

        requestType: data.requestType,

        expiryDate: data.expiryDate
          ? new Date(data.expiryDate)
          : null,

        documentUrl: documentUrl ?? null,

        // user cannot approve himself
        status: "PENDING",

        issuedBy: null,

        issuedAt: null,
      },
    });
  }



  /**
   * =====================================
   * GET MY LICENSE
   * =====================================
   */
  static async getLicenseByUserId(
    userId: string
  ) {

    return prisma.businessLicense.findUnique({
      where: {
        userId,
      },
    });
  }



  /**
   * =====================================
   * CHECK IF LICENSE REQUIRED
   * =====================================
   */
  static async isLicenseRequired(
    userId: string
  ) {

    const vehicle = await prisma.vehicle.findFirst({

      where: {

        userId,

        vehicleType: {
          requiresBusinessLicense: true,
        },

        isDeleted: false,
      },

      select:{
        id:true,
      },
    });


    return Boolean(vehicle);
  }



  /**
   * =====================================
   * GET REQUIRED VEHICLE
   * =====================================
   */
  static async hasLicenseRequiredVehicle(
    userId:string
  ){

    return prisma.vehicle.findFirst({

      where:{

        userId,

        vehicleType:{
          requiresBusinessLicense:true,
        },

        isDeleted:false,

      },

      select:{
        id:true,
      },
    });
  }




  /**
   * =====================================
   * RENEW REQUEST (USER)
   * =====================================
   */
  static async renewRequest(

    userId:string,

    documentUrl:string,

    expiryDate:Date

  ){

    const license =
      await prisma.businessLicense.findUnique({

        where:{
          userId,
        },

      });


    if(!license){

      throw new Error(
        "Business license not found"
      );

    }



    return prisma.businessLicense.update({

      where:{
        userId,
      },

      data:{

        documentUrl,

        expiryDate,

        requestType:"RENEW",

        status:"PENDING",

        issuedBy:null,

        issuedAt:null,

      },

    });

  }




  /**
   * =====================================
   * UPDATE LICENSE (USER)
   * =====================================
   */
  static async update(

    userId:string,

    data:any,

    filePath?:string

  ){

    const existing =
      await prisma.businessLicense.findUnique({

        where:{
          userId,
        },

      });



    if(!existing){

      throw new Error(
        "Business license not found"
      );

    }



    return prisma.businessLicense.update({

      where:{
        userId,
      },


      data:{

        licenseNumber:data.licenseNumber,

        expiryDate:data.expiryDate
          ? new Date(data.expiryDate)
          : existing.expiryDate,


        ...(filePath && {

          documentUrl:filePath,

        }),

      },

    });

  }




  /**
   * =====================================
   * ADMIN DASHBOARD SUMMARY
   * =====================================
   */
  static async getSummary(){

    const [

      total,

      pending,

      active,

      rejected,

      expired,

      newRequests,

      renewRequests,

    ] = await Promise.all([


      prisma.businessLicense.count(),


      prisma.businessLicense.count({

        where:{
          status:"PENDING",
        },

      }),



      prisma.businessLicense.count({

        where:{
          status:"ACTIVE",
        },

      }),



      prisma.businessLicense.count({

        where:{
          status:"REJECTED",
        },

      }),



      prisma.businessLicense.count({

        where:{
          status:"EXPIRED",
        },

      }),



      prisma.businessLicense.count({

        where:{
          requestType:"NEW",
        },

      }),



      prisma.businessLicense.count({

        where:{
          requestType:"RENEW",
        },

      }),


    ]);



    return {

      total,

      pending,

      active,

      rejected,

      expired,

      newRequests,

      renewRequests,

    };

  }

/**
 * =====================================
 * ADMIN - GET ALL LICENSES
 * =====================================
 */
static async getAll(query: any) {

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  const skip = (page - 1) * limit;


  const search = String(
    query.search ?? ""
  ).trim();


  const status = query.status
    ? String(query.status)
    : undefined;


  const requestType = query.requestType
    ? String(query.requestType)
    : undefined;



  const where:any = {

    ...(status && {
      status,
    }),


    ...(requestType && {
      requestType,
    }),



    ...(search && {

      OR:[

        {
          licenseNumber:{
            contains:search,
            mode:"insensitive",
          },
        },


        {
          user:{
            full_name:{
              contains:search,
              mode:"insensitive",
            },
          },
        },


        {
          user:{
            phone:{
              contains:search,
              mode:"insensitive",
            },
          },
        },

      ],

    }),

  };



  const [
    data,
    total,
    groupedSummary
  ] = await Promise.all([


    prisma.businessLicense.findMany({

      where,

      skip,

      take: limit,

      orderBy:{
        createdAt:"desc",
      },


      include:{

        user:{

          select:{

            id:true,

            full_name:true,

            phone:true,

            email:true,

            profile_image:true,

          },

        },

      },

    }),



    prisma.businessLicense.count({

      where,

    }),



    prisma.businessLicense.groupBy({

      by:[
        "status",
        "requestType",
      ],

      _count:{
        _all:true,
      },

    }),


  ]);



  const summary = {

    total,

    pending:0,

    active:0,

    rejected:0,

    expired:0,

    newRequests:0,

    renewRequests:0,

  };



  groupedSummary.forEach((item)=>{

    const count =
      item._count._all;



    switch(item.status){

      case "PENDING":
        summary.pending += count;
        break;


      case "ACTIVE":
        summary.active += count;
        break;


      case "REJECTED":
        summary.rejected += count;
        break;


      case "EXPIRED":
        summary.expired += count;
        break;

    }



    switch(item.requestType){

      case "NEW":
        summary.newRequests += count;
        break;


      case "RENEW":
        summary.renewRequests += count;
        break;

    }


  });



  return {

    data,


    meta:{

      page,

      limit,

      total,

      totalPages:
        Math.ceil(total / limit),


      hasNext:
        page < Math.ceil(total / limit),


      hasPrev:
        page > 1,

    },


    summary,

  };

}



/**
 * =====================================
 * ADMIN - GET LICENSE DETAILS
 * =====================================
 */
static async getById(
  id:string
){


  const license =
    await prisma.businessLicense.findUnique({

      where:{
        id,
      },


      include:{

        user:{

          select:{

            id:true,

            full_name:true,

            phone:true,

            email:true,

            profile_image:true,


            vehicles:{

              select:{

                id:true,

                plateNumber:true,

                vehicleType:true,

              },

            },

          },

        },

      },

    });



  if(!license){

    throw new Error(
      "Business license not found"
    );

  }



  return license;

}

/**
 * =====================================
 * ADMIN - APPROVE LICENSE
 * =====================================
 */
static async approve(
  id: string,
  adminId: string,
  data: any
) {

  const license =
    await prisma.businessLicense.findUnique({
      where: {
        id,
      },
    });


  if (!license) {
    throw new Error(
      "Business license not found"
    );
  }


  if (license.status === "ACTIVE") {
    throw new Error(
      "License already approved"
    );
  }



  return prisma.businessLicense.update({

    where: {
      id,
    },


    data: {

      status: "ACTIVE",


      issuedBy: adminId,


      issuedAt: new Date(),


      ...(data.expiryDate && {

        expiryDate: new Date(
          data.expiryDate
        ),

      }),



      ...(data.licenseNumber && {

        licenseNumber:
          data.licenseNumber,

      }),

    },

  });

}





/**
 * =====================================
 * ADMIN - REJECT LICENSE
 * =====================================
 */
static async reject(
  id: string,
  adminId: string,
  reason?: string
) {


  const license =
    await prisma.businessLicense.findUnique({

      where:{
        id,
      },

    });



  if(!license){

    throw new Error(
      "Business license not found"
    );

  }



  if(license.status === "ACTIVE"){

    throw new Error(
      "Active license cannot be rejected"
    );

  }




  return prisma.businessLicense.update({

    where:{
      id,
    },


    data:{

      status:"REJECTED",


      issuedBy:adminId,


      issuedAt:new Date(),


      // Uncomment after adding field
      // rejectionReason: reason,

    },

  });

}

}
