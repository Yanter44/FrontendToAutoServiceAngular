export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
