import { filterAndSort } from '../../core/utils/helpers';

export function filterPageItems<T>(
  items: T[],
  searchValue: string,
  searchFields: string[],
  sortValue: string,
  sortOptions: Record<string, (a: T, b: T) => number>
): T[] {
  return filterAndSort({
    items: items as unknown as Record<string, unknown>[],
    searchValue,
    searchFields,
    sortValue,
    sortOptions: sortOptions as unknown as Record<string, (a: Record<string, unknown>, b: Record<string, unknown>) => number>
  }) as unknown as T[];
}
