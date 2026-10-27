export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export const emptyPagedResult = <T>(): PagedResult<T> => ({
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0
});
