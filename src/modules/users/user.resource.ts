import { ROLE_PERMISSIONS } from "../../rules/role.permissions";
import { Role } from "../../rules/roles";

/* -----------------------------
   USER RESOURCE MAPPER
------------------------------ */
export const userResource = (user: any) => {
  const station = user.managedStation;

  const driverProfile = user.driverProfile;

  // DriverLicense is a separate 1:1 relation off DriverProfile
  // (driverProfile.license), not flat fields on driverProfile itself.
  const license = driverProfile?.license;

  return {
    id: user.id,

    /* identity */
    fullName: user.full_name,

    email: user.email ?? null,

    phoneNumber: user.phone,

    avatar: user.profile_image ?? null,

    /* enums */
    role: user.role,

    status: user.status,

    gender: user.gender,

    /* station */
    stationId: station?.id ?? null,

    station: station
      ? {
          id: station.id,
          name: station.name,
          lat: station.lat ?? null,
          lng: station.lng ?? null,
          status: station.status ?? null,
        }
      : null,

    /* driver profile */
    driverProfile: driverProfile
      ? {
          id: driverProfile.id,

          age: driverProfile.age,

          nationalId: driverProfile.nationalId,

          /* license — nested to mirror the Prisma relation.
             `status` here comes straight from the DB enum
             (PENDING / ACTIVE / EXPIRED / REJECTED, whatever
             DriverLicenseStatus defines) — no client-side
             recomputation needed. */
          license: license
            ? {
                id: license.id,
                licenseNumber: license.licenseNumber,
                documentUrl: license.documentUrl ?? null,
                issuedAt: license.issuedAt ?? null,
                expiryDate: license.expiryDate ?? null,
                status: license.status,
                verifiedAt: license.verifiedAt ?? null,
                rejectionReason: license.rejectionReason ?? null,
              }
            : null,
        }
      : null,

    /* RBAC */
    permissions: ROLE_PERMISSIONS[user.role as Role] ?? [],

    /* audit */
    createdAt: user.createdAt,
  };
};