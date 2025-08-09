import UserDetails from './UserDetails';

import { DoctorDetails } from './UserDetails';

export default interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  age?: number;
  online?: boolean;
  userDetails?: UserDetails;
  doctorDetails?: DoctorDetails;
  gender?: string;
  height?: number;
  weight?: number;
}