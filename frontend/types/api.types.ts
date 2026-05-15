export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiResponse<TData> {
  data: TData;
  error?: ApiError;
}
