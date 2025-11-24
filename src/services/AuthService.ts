import api from '../api/api';
import { postData } from '../api/apiClient';
import { Api } from '../config/apiConstant';
import { ApiResponse, ApiResponseUnknown, RequestConfig } from '../types/types';
import { toast } from '../utils/Toast';

const PUBLIC_CONFIG = { skipAuth: true } as RequestConfig;

export const Register = async (identifier: string): Promise<ApiResponseUnknown> => {
  const res = await postData(Api.REGISTER, { identifier }, PUBLIC_CONFIG);
  return res as ApiResponseUnknown;
};

export const VerifyOtp = async (identifier: string, otp: string): Promise<ApiResponseUnknown> => {
  const res = await postData(Api.VERIFY_OTP, { identifier, otp }, PUBLIC_CONFIG);
  return res as ApiResponseUnknown;
};

export const RefreshToken = async (
  refreshToken: string,
): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>> => {
  const response = await api.post(Api.REFRESH, { refreshToken });
  return response.data as ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>;
};

export const GetProfile = async (): Promise<ApiResponseUnknown> => {
  try {
    const response = await api.get(Api.SAVE_PROFILE);
    return response.data as ApiResponseUnknown;
  } catch (err: unknown) {
    let message = 'Something went wrong. Please try again.';

    if (err instanceof Error && err.message) {
      message = err.message;
    }

    toast.error(message);
    throw err;
  }
};
