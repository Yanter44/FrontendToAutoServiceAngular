import { RoleType } from '../../core/model';

export function userRoleBadgeClass(role?: string): string {
  switch (role) {
    case RoleType.Admin:
      return 'UserRoleBadge UserRoleAdmin';
    case RoleType.Agent:
      return 'UserRoleBadge UserRoleAgent StatusGreen';
    case RoleType.Moderator:
      return 'UserRoleBadge UserRoleModerator';
    default:
      return 'StatusBadge';
  }
}

export function userRoleLabel(role?: string): string {
  switch (role) {
    case RoleType.Admin:
      return 'Админ';
    case RoleType.Agent:
      return 'Агент';
    case RoleType.Moderator:
      return 'Модератор';
    default:
      return role || '—';
  }
}

export function normalRoleName(role?: string): string {
  switch (role) {
    case RoleType.Admin:
      return 'Администратор';
    case RoleType.Moderator:
      return 'Модератор';
    case RoleType.Agent:
      return 'Агент';
    default:
      return role || '—';
  }
}
