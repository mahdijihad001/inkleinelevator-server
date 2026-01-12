import { Role } from "generated/prisma/enums";

export interface IUser {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'USER' | 'ELEVATOR' | 'ADMIN'; // adjust based on your Role enum
  companyName?: string;
  businessLogo?: string;
  licenseNo?: string;
  license?: string;
  companyDescription?: string;
  servicesType?: string;
  yearFounded?: string;
  numberOfEmployee?: string;
  website?: string;
  businessAddress?: string;
  isNotification?: boolean;
}


export interface ISignUp {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;

  // Required only for ELEVATOR
  companyName?: string;
  licenseInfo?: string;
  businessLogo?: string;
}