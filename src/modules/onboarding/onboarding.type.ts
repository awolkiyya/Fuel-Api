import { Gender } from "@prisma/client";

export type UpdateProfileDTO = {
  full_name: string;
  age: number;
  gender:Gender;
  national_id: string;
  license_number: string;

  // optional fields (important for real apps)
  email?: string | null;
  phone: string;
};
  
  export type OnboardingProfile = {
    id: string;
    full_name: string;
    phone: string;
    role: string;
  
    age: number | null;
    gender: string | null;
    national_id: string | null;
    license_number: string | null;
  
    is_profile_completed: boolean;
    createdAt: Date;
  };