import prisma from "../../config/db"

export const driverRepository = {
  // GET ALL DRIVERS
  findAll: async ({
    skip,
    limit,
    search,
    status,
    riskLevel,
    vehicleFilter,
  }: any) => {
    const where: any = {
      role: "driver",
    }

    /* -----------------------------
       SEARCH
    ------------------------------ */
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    /* -----------------------------
       STATUS
    ------------------------------ */
    if (status && status !== "all") {
      where.status = status
    }

    /* -----------------------------
       RISK (HIGH-LEVEL MANAGEMENT FIX)
    ------------------------------ */
    if (riskLevel && riskLevel !== "all") {
      where.risks = {
        some: {
          level: riskLevel, // low | medium | high
        },
      }
    }

    /* -----------------------------
       VEHICLE FILTER
    ------------------------------ */
    if (vehicleFilter && vehicleFilter !== "all") {
      if (vehicleFilter === "single") {
        where.vehicles = {
          _count: {
            equals: 1,
          },
        }
      }

      if (vehicleFilter === "multiple") {
        where.vehicles = {
          _count: {
            gt: 1,
          },
        }
      }
    }

    /* -----------------------------
       QUERY
    ------------------------------ */
    return prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        profile_image: true,
        status: true,
        createdAt: true,

        driverProfile:{
          select:{
            age:true,
            nationalId:true,
            licenseNumber:true,
            licenseExpiry:true,
            isVerified :true,
          }
        },

        /* VEHICLES */
        vehicles: {
          select: {
            id: true,
            plateNumber: true,
          },
        },

        /* RISK (LATEST ONLY) */
        risks: {
          select: {
            id: true,
            level: true,
            status: true,
            reason: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })
  },

  // COUNT DRIVERS
  count: async ({
    search,
    status,
    riskLevel,
    vehicleFilter,
  }: any) => {
    const where: any = {
      role: "driver",
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    /* RISK FIX */
    if (riskLevel && riskLevel !== "all") {
      where.risks = {
        some: {
          level: riskLevel,
        },
      }
    }

    /* VEHICLE FILTER */
    if (vehicleFilter && vehicleFilter !== "all") {
      if (vehicleFilter === "single") {
        where.vehicles = { _count: { equals: 1 } }
      }

      if (vehicleFilter === "multiple") {
        where.vehicles = { _count: { gt: 1 } }
      }
    }

    return prisma.user.count({ where })
  },

  // GET DRIVER BY ID
  findById: async (id: string) => {
    return prisma.user.findFirst({
      where: {
        id,
        role: "driver",
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        email: true,
        profile_image: true,
        status: true,
        createdAt: true,

        driverProfile: true,
        vehicles: true,

        risks: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })
  },
}