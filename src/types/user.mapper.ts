export const mapUserResponse = (user: any, permissions: string[] = []) => {
    return {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
      profile_image: user.profile_image,
  
      role: user.role,
      status: user.status,
      gender: user.gender,
  
      driverProfile: user.driverProfile
        ? {
            age: user.driverProfile.age,
            nationalId: user.driverProfile.nationalId,
            licenseNumber: user.driverProfile.licenseNumber,
            licenseExpiry: user.driverProfile.licenseExpiry,
            isVerified: user.driverProfile.isVerified,
          }
        : null,
  
      permissions,
    };
  };