import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import { Url } from "../config/apiConstant";
import {
  getTokens,
  setTokens,
  clearTokens,
  getAccessToken,
} from "../services/tokenService";
import { RefreshToken as refreshTokenService } from "../services/AuthService";
import {
  ApiError,
  QueueItem,
  RefreshResponse,
  TokenPair,
} from "./apiTypes";

const api: AxiosInstance = axios.create({
  baseURL: Url.BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  validateStatus: () => true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
    else p.reject(new ApiError("No token available after refresh"));
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      const token = await getAccessToken();
      const headers = (config.headers as AxiosRequestHeaders) || {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
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
    const axiosError = error as AxiosError | undefined;
    const status = axiosError?.response?.status;
    const originalRequest = (axiosError?.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined);

    if (!originalRequest) return Promise.reject(error);

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              const headers = (originalRequest.headers as AxiosRequestHeaders) || {};
              headers["Authorization"] = `Bearer ${token}`;
              originalRequest.headers = headers;
              resolve(api(originalRequest));
            },
            reject: (err: unknown) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokenPair = (await getTokens()) as TokenPair | null;
        const refreshToken = tokenPair?.refreshToken;
        if (!refreshToken) throw new ApiError("No refresh token available", tokenPair);

        const res = (await refreshTokenService(refreshToken)) as RefreshResponse;

        if (res?.code === 200 && res.data?.tokens) {
          const newAccessToken = res.data.tokens.accessToken;
          const newRefreshToken = res.data.tokens.refreshToken;

          await setTokens(newAccessToken, newRefreshToken);

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          const headers = (originalRequest.headers as AxiosRequestHeaders) || {};
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers = headers;

          return api(originalRequest);
        }

        processQueue(res ?? new ApiError("Refresh failed"), null);
        await clearTokens();
        return Promise.reject(new ApiError("Refresh token failed", res ?? undefined));
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
