import { ROLE_PERMISSIONS } from "../../rules/role.permissions";
import { Role } from "../../rules/roles";


/* -----------------------------
   USER RESOURCE MAPPER
------------------------------ */
export const userResource = (user: any) => {

  const station =
    user.managedStation;


  const driverProfile =
    user.driverProfile;


  return {

    id: user.id,


    /* identity */
    fullName:
      user.full_name,

    email:
      user.email ?? null,

    phoneNumber:
      user.phone,

    avatar:
      user.profile_image ?? null,



    /* enums */
    role:
      user.role,

    status:
      user.status,

    gender:
      user.gender,



    /* auth */
    firebaseUid:
      user.firebase_uid ?? null,



    /* station */
    stationId:
      station?.id ?? null,


    station:
      station
        ? {
            id: station.id,
            name: station.name,
            lat: station.lat ?? null,
            lng: station.lng ?? null,
            status: station.status ?? null,
          }
        : null,



    /* driver profile */
    driverProfile:
      driverProfile
        ? {
            id:
              driverProfile.id,

            age:
              driverProfile.age,

            nationalId:
              driverProfile.nationalId,

            licenseNumber:
              driverProfile.licenseNumber,

            licenseExpiry:
              driverProfile.licenseExpiry,

            isVerified:
              driverProfile.isVerified,

          }
        : null,



    /* RBAC */
    permissions:
      ROLE_PERMISSIONS[user.role as Role] ?? [],



    /* audit */
    createdAt:
      user.createdAt,

  };

};