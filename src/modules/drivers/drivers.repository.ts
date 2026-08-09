import prisma from "../../config/db"

/* -----------------------------
   VEHICLE FILTER RESOLVER
   Prisma has no "exactly N" / "more than N" relation-count
   operator inside `where` — `_count` only works in `select`
   and `orderBy`. So instead of filtering the User query
   directly, we first resolve which userIds have 1 vehicle vs
   2+, then filter on `id: { in: [...] }`.
------------------------------ */
async function resolveVehicleFilterUserIds(
  vehicleFilter: "single" | "multiple"
): Promise<string[]> {
  const counts = await prisma.vehicle.groupBy({
    by: ["userId"],
    where: { isDeleted: false },
    _count: { id: true },
  })

  return counts
    .filter((c) =>
      vehicleFilter === "single" ? c._count.id === 1 : c._count.id > 1
    )
    .map((c) => c.userId)
}

/* -----------------------------
   RISK FILTER RESOLVER
   `risks: { some: { level } }` (the previous approach) matches
   a user if ANY risk record they've ever had matches — including
   old, superseded ones. Since risks are a history log (multiple
   rows over time, most recent = current), filtering correctly
   means comparing against each user's *latest* risk row only.
   `distinct` + `orderBy` in Prisma returns the first row per
   distinct group according to that order, so this gets the
   latest risk per user.
------------------------------ */
async function resolveRiskFilterUserIds(
  riskLevel: "low" | "medium" | "high"
): Promise<string[]> {
  const latestPerUser = await prisma.userRisk.findMany({
    distinct: ["userId"],
    orderBy: { createdAt: "desc" },
    select: { userId: true, level: true },
  })

  return latestPerUser
    .filter((r) => r.level === riskLevel)
    .map((r) => r.userId)
}

/* -----------------------------
   SHARED WHERE BUILDER
   Exported and called ONCE per request by the service layer,
   which then passes the resolved `where` into both findAll and
   count. Previously each of findAll/count called this
   independently inside the same Promise.all, so a risk or
   vehicle filter meant resolveRiskFilterUserIds /
   resolveVehicleFilterUserIds ran twice per request instead of
   once.
------------------------------ */
export async function buildDriverWhere({
  search,
  status,
  riskLevel,
  vehicleFilter,
}: {
  search?: string
  status?: string
  riskLevel?: "low" | "medium" | "high"
  vehicleFilter?: "single" | "multiple"
}) {
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

  // Both filters resolve to an `id in [...]` condition. If both are
  // active at once we need the *intersection*, not two separate
  // `where.id` assignments overwriting each other — so we collect
  // them into `where.AND`.
  const andConditions: any[] = []

  if (riskLevel) {
    const ids = await resolveRiskFilterUserIds(riskLevel)
    andConditions.push({ id: { in: ids } })
  }

  if (vehicleFilter) {
    const ids = await resolveVehicleFilterUserIds(vehicleFilter)
    andConditions.push({ id: { in: ids } })
  }

  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  return where
}

export const driverRepository = {
  // GET ALL DRIVERS
  // Takes a pre-built `where` instead of the raw filter params —
  // the service resolves it once and shares it with count().
  findAll: async ({
    where,
    skip,
    limit,
  }: {
    where: any
    skip: number
    limit: number
  }) => {
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
  
        driverProfile: {
          select: {
            age: true,
            nationalId: true,
  
            license: {
              select: {
                id: true,
                licenseNumber: true,
                documentUrl: true,
                issuedAt: true,
                expiryDate: true,
                status: true,
                verifiedBy: true,
                verifiedAt: true,
                rejectionReason: true,
              },
            },
          },
        },
  
        vehicles: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
  
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
  // Takes the same pre-built `where` as findAll — see buildDriverWhere.
  count: async ({ where }: { where: any }) => {
    return prisma.user.count({ where })
  },

  // GET DRIVER BY ID
  // Full detail view — needs businessLicense, gender, role, updatedAt,
  // and the COMPLETE risks history (no `take: 1`), since the Risks
  // tab and the tab-bar badge count both depend on seeing every
  // flag, not just the most recent one.
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
        role: true,
        gender: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        driverProfile: true,
        vehicles: true,
        businessLicense: true,

        risks: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
  },
}