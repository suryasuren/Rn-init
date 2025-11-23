export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  code?: number;
  message?: string;
  data?: T;
}

export interface RefreshResponseData {
  tokens: TokenPair;
}

export interface RefreshResponse extends ApiResponse<RefreshResponseData> {}

export type QueueResolve = (token: string) => void;
export type QueueReject = (err: unknown) => void;

export interface QueueItem {
  resolve: QueueResolve;
  reject: QueueReject;
}

export class ApiError extends Error {
  public payload?: unknown;
  constructor(message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.payload = payload;
  }
}
