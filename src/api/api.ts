// src/api/api.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosError,
} from "axios";
import { Url, Api } from "../config/apiConstant";
import {
  getTokens,
  setTokens,
  clearTokens,
  getAccessToken,
} from "../services/tokenService";

export class ApiError extends Error {
  public payload?: unknown;
  public code?: number;
  constructor(message: string, payload?: unknown, code?: number) {
    super(message);
    this.payload = payload;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export type InternalConfig = InternalAxiosRequestConfig & { skipAuth?: boolean };

type RefreshResponse = {
  code?: number;
  data?: {
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };
};

const api: AxiosInstance = axios.create({
  baseURL: Url.BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  validateStatus: () => true,
});

const refreshApi: AxiosInstance = axios.create({
  baseURL: Url.BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  validateStatus: () => true,
});

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  for (const p of failedQueue) {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
    else p.reject(new ApiError("No token available after refresh"));
  }
  failedQueue = [];
};

api.interceptors.request.use(
  async (config: InternalConfig): Promise<InternalConfig> => {
    try {
      const skipAuth = config?.skipAuth === true;
      const headers = (config.headers as AxiosRequestHeaders) ?? {};

      if (!skipAuth) {
        const token = await getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } else {
        delete headers["Authorization"];
      }

      config.headers = headers;
    } catch (err) {
      console.warn("auth interceptor error", err);
    }
    return config;
  },
  (err) => Promise.reject(err),
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const axiosErr = error as AxiosError<unknown, InternalConfig>;
    const status = axiosErr.response?.status;
    const originalRequest = axiosErr.config as (InternalConfig & { _retry?: boolean });

    if (!originalRequest) return Promise.reject(error);

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              const headers = (originalRequest.headers as AxiosRequestHeaders) ?? {};
              headers["Authorization"] = `Bearer ${token}`;
              originalRequest.headers = headers;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const stored = await getTokens();
        const refreshToken = stored?.refreshToken;
        if (!refreshToken) throw new ApiError("No refresh token available", stored);

        const refreshRes = await refreshApi.post(Api.REFRESH, { refreshToken });
        const refreshBody = refreshRes.data as RefreshResponse;

        const tokens = refreshBody?.data?.tokens;
        const newAccessToken = tokens?.accessToken;
        const newRefreshToken = tokens?.refreshToken;

        if (refreshRes.status === 200 && newAccessToken) {
          await setTokens(newAccessToken, newRefreshToken ?? refreshToken);

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);

          const headers = (originalRequest.headers as AxiosRequestHeaders) ?? {};
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers = headers;

          return api(originalRequest);
        }

        processQueue(new ApiError("Refresh failed", refreshBody), null);
        await clearTokens();
        return Promise.reject(new ApiError("Refresh token failed", refreshBody));
      } catch (err) {
        processQueue(err, null);
        await clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
export { refreshApi };
