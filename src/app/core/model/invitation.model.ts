import { RoleType } from "./enum";

export interface AcceptInvitationRequest {
  token: string;
  fio: string;
  password: string;
}

export interface InvitationPreview {
  email: string;
  roleType: RoleType | string;
}

export interface InviteUserRequest {
  email: string;
  role?: string;
  branchId?: number;
}

