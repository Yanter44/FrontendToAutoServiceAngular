import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';
import { ApplicationStatus, RoleType } from '../model';

export const dateTimeFormatter = {
  formatDate(dateString?: string | null): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
  },
  formatDateTime(dateString?: string | null): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function escapeHtml(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isMobileLayout(): boolean {
  return window.matchMedia('(max-width: 1024px)').matches;
}

export function filterAndSort<T extends Record<string, unknown>>(options: {
  items: T[];
  searchValue?: string;
  searchFields: string[];
  sortValue?: string;
  sortOptions: Record<string, (a: T, b: T) => number>;
}): T[] {
  let result = [...options.items];
  const searchValue = options.searchValue?.toLowerCase().trim();
  if (searchValue) {
    result = result.filter(item =>
      options.searchFields.some(field =>
        item[field]?.toString().toLowerCase().includes(searchValue)
      )
    );
  }
  const sortFunction = options.sortValue ? options.sortOptions[options.sortValue] : undefined;
  if (sortFunction) {
    result.sort(sortFunction);
  }
  return result;
}

export const ROLE_LABELS: Record<string, string> = {
  [RoleType.Agent]: 'Агента',
  [RoleType.Moderator]: 'Модератора',
  [RoleType.Admin]: 'Администратора'
};
