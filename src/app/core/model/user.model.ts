import { RedactUserTab } from './enum/redact-user-tab.enum';

export interface UserDto {
  userId: number;
  role: string;
  fio: string;
  email: string;
  regDate?: string;
  balance?: number;
  debtLimit?: number;
  isBlocked?: boolean;
}

export interface AgentListItem {
  id: number;
  fio: string;
  balance: number;
}

export interface DeleteUserRequest {
  userId: number | string;
}

export interface BlockUserRequest {
  blockUserId: number | string;
  reason: string;
  blockUntil: string | null;
}

export interface UnblockUserRequest {
  unblockUserId: number | string;
  unblockReason: string;
}

export interface ChangeUserDebtLimitRequest {
  userId: number | string;
  debtLimit: number;
}

export interface UserBlockHistoryItem {
  blockedAt: string;
  reason?: string;
  blockedByFIO?: string;
  isActive: boolean;
  wasAutoUnblocked?: boolean;
}

export interface ProfileDto {
  name?: string;
  fio?: string;
  role?: string;
}

export interface RedactUserState {
  userId: number | null;
  user: UserDto | null;
  activeTab: RedactUserTab | string;
  blockHistory: UserBlockHistoryItem[];
  blockHistoryLoaded: boolean;
}
