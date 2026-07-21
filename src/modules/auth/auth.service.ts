import prisma from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RegisterInput, AuthResponse } from "./auth.types";
import { Role } from "../../rules/roles";
import { ROLE_PERMISSIONS } from "../../rules/role.permissions";
import admin from "../../config/firebase";
import { mapUserResponse } from "../../types/user.mapper";
import { userResource } from "../users/user.resource";



const JWT_SECRET = process.env.JWT_SECRET!;

// REGISTER
export const registerUser = async (
  data: RegisterInput
): Promise<AuthResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { phone: data.phone },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      role: "driver",
    },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const role = user.role as Role;

  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      permissions, // 👈 frontend uses this

    },
    token,
  };
};

// LOGIN

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  // 1. find user by EMAIL (NOT phone)
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // 2. ensure password exists
  if (!user.password) {
    throw new Error("User password not set");
  }

  // 3. compare password
  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // 4. RBAC permissions
  const role = user.role as Role;
  const permissions = ROLE_PERMISSIONS[role] || [];

  // 5. generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      role,
      permissions,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 6. return clean response
  return {
    user: userResource({
      ...user,
      permissions,
    }),
    token,
  };
};




// export const firebaseLoginUser = async (idToken: string) => {
//   if (!idToken) {
//     throw new Error("Firebase ID token is required");
//   }

//   // 1. VERIFY FIREBASE TOKEN
//   const decoded = await admin.auth().verifyIdToken(idToken);

//   const uid = decoded.uid;
//   const phone = decoded.phone_number;

//   if (!uid) throw new Error("Invalid Firebase token");
//   if (!phone) throw new Error("Phone number not provided by Firebase");

//   // 2. FIND USER
//   let user = await prisma.user.findFirst({
//     where: {
//       OR: [{ firebase_uid: uid }, { phone }],
//     },
//     include: {
//       driverProfile: true,
//     },
//   });

//   // 3. CREATE OR LINK USER
//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         firebase_uid: uid,
//         phone,
//         role: "driver",
//         full_name: "",
//         status: "ACTIVE",
//         gender: "MALE",
//       },
//       include: {
//         driverProfile: true,
//       },
//     });
//   } else {
//     if (!user.firebase_uid) {
//       user = await prisma.user.update({
//         where: { id: user.id },
//         data: { firebase_uid: uid },
//         include: {
//           driverProfile: true,
//         },
//       });
//     }
//   }

//   // 4. ROLE + PERMISSIONS
//   const role = user.role;
//   const permissions = ROLE_PERMISSIONS[role] || [];

//   // 5. TOKEN
//   const token = jwt.sign(
//     {
//       id: user.id,
//       role,
//       permissions,
//     },
//     JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   // 6. CLEAN RESPONSE (IMPORTANT)
//   return {
//     user: mapUserResponse(user, permissions),
//     token,
//     hasDriverProfile: !!user.driverProfile,
//   };
// };