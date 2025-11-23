import api from "../api/apiClient";
import { Api } from "../config/apiConstant";

export type ApiResponse<T = unknown> = { code?: number; message?: string; data?: T };

export const Register = async (identifier: string): Promise<ApiResponse> => {
  const response = await api.post(Api.REGISTER, { identifier });
  return response.data as ApiResponse;
};

export const VerifyOtp = async (identifier: string, otp: string): Promise<ApiResponse> => {
  const response = await api.post(Api.VERIFY_OTP, { identifier, otp });
  return response.data as ApiResponse;
};

export const RefreshToken = async (refreshToken: string): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>> => {
  const response = await api.post(Api.REFRESH, { refreshToken });
  return response.data as ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>;
};
