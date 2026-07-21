import { Permission } from "../../rules/permissions";

export type RegisterInput = {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
  };
  
  export type LoginInput = {
    phone: string;
    password: string;
  };
  
  export type AuthUser = {
    id: string;
    full_name: string;
    phone: string;
    role: string;
    permissions: Permission[];
  };
  
  export type AuthResponse = {
    user: AuthUser;
    token: string;
  };