import { CheckResult } from './risk';

export interface ApiSuccessResponse {
  success: true;
  data: CheckResult;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  uptime: number;
  cache_size: number;
}
