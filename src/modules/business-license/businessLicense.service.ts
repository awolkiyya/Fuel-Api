import prisma from "../../config/db";

export class BusinessLicenseService {
  /**
   * CREATE LICENSE
   */
  static async create(
    data: any,
    documentUrl?: string
  ) {
    const existing = await prisma.businessLicense.findUnique({
      where: { userId: data.userId },
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
    
        requestType: data.requestType,
    
        licenseNumber: data.licenseNumber,
    
        expiryDate: data.expiryDate
          ? new Date(data.expiryDate)
          : null,
    
        issuedBy: data.issuedBy,
    
        issuedAt: data.issuedAt
          ? new Date(data.issuedAt)
          : null,
    
        documentUrl: documentUrl ?? null,
    
        status: "PENDING",
      },
    });
  }

  /**
   * GET LICENSE BY USER
   */
  static async getLicenseByUserId(userId: string) {
    return prisma.businessLicense.findUnique({
      where: { userId },
    });
  }

  static async isLicenseRequired(userId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        userId,
        vehicleType: {
          requiresBusinessLicense: true,
        },
        isDeleted: false,
      },
      select: { id: true },
    });
  
    return !!vehicle;
  }

  static async hasLicenseRequiredVehicle(userId: string) {
    return prisma.vehicle.findFirst({
      where: {
        userId,
        vehicleType: { requiresBusinessLicense: true },
        isDeleted: false,
      },
      select: { id: true },
    });
  }

  static async renewRequest(
    userId: string,
    documentUrl: string,
    expiryDate: Date
  ) {
    const license = await prisma.businessLicense.findUnique({
      where: { userId },
    });
  
    if (!license) {
      throw new Error("License not found");
    }
  
    return prisma.businessLicense.update({
      where: { userId },
      data: {
        documentUrl,
        expiryDate,   // ✅ NOW INCLUDED
        status: "PENDING",
      },
    });
  }

  static async update(userId: string, data: any, filePath?: string) {
    const existing = await prisma.businessLicense.findUnique({
      where: { userId },
    });
  
    if (!existing) {
      throw new Error("Business license not found");
    }
  
    return prisma.businessLicense.update({
      where: { userId },
      data: {
        ...data,
        ...(filePath && { documentUrl: filePath }),
      },
    });
  }
}