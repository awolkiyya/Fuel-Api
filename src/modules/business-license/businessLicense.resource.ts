export class BusinessLicenseResource {

    static make(license: any) {
  
      if (!license) {
        return null;
      }
  
  
      return {
  
        id: license.id,
  
  
        licenseNumber:
          license.licenseNumber,
  
  
        documentUrl:
          license.documentUrl,
  
  
        expiryDate:
          license.expiryDate,
  
  
        requestType:
          license.requestType,
  
  
        status:
          license.status,
  
  
        issuedAt:
          license.issuedAt,
  
  
        createdAt:
          license.createdAt,
  
  
        updatedAt:
          license.updatedAt,
  
  
  
        user: license.user
          ? {
  
              id: license.user.id,
  
              full_name:
                license.user.full_name,
  
              phone:
                license.user.phone,
  
              email:
                license.user.email,
  
            }
          : undefined,
  
  
      };
  
    }
  
  
  
    static collection(items:any[]) {
  
      return items.map(
        item => this.make(item)
      );
  
    }
  
  }