export interface IUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'USER' | 'ELEVATOR' | 'ADMIN'; // adjust based on your Role enum
  companyName?: string;
  businessLogo?: string;
  licenseInfo?: string;
  licenseNo?: string;
  companyDescription?: string;
  servicesType?: string;
  yearFounded?: string;
  numberOfEmployee?: string;
  website?: string;
  businessAddress?: string;
  isNotification: boolean;
}