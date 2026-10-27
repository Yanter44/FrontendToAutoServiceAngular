import { RoleType } from './enum/role-type.enum';

export interface MeResponse {
  roleType: RoleType | string;
  fio?: string;
  email?: string;
  isBlocked?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ConfirmRegistrationCodeRequest {
  registrationId: string;
  code: string;
}

export interface FinishRegistrationRequest {
  registrationId: string | null;
  fio: string | null;
  email: string | null;
  password: string | null;
  Email?: string;
  Password?: string;
  RegistrationId?: string;
}

