export interface ApiResponse<T> {
  status: number;
  error: any;
  data: T;
}
