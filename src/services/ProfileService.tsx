import { getData, postData, putData } from '../api/apiClient';
import { Api } from '../config/apiConstant';
import { toast } from '../utils/Toast';
import { extractErrorMessage } from '../utils/Helper';
import { ApiResponse, RequestConfig } from '../types/types';

const PUBLIC_CONFIG: RequestConfig = { skipAuth: true };

async function handleRequest<T>(
  fn: () => Promise<T>,
  fallback = 'Something went wrong. Please try again.',
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const msg = extractErrorMessage(err) || fallback;
    toast.error(msg);
    throw err;
  }
}

export const SignOut = () =>
  handleRequest<ApiResponse<unknown>>(() => postData<ApiResponse<unknown>>(Api.LOGOUT));

export const IdentifyRegister = (identifier: string) =>
  handleRequest<ApiResponse<unknown>>(
    () => postData<ApiResponse<unknown>>(Api.IDENTIFY_REGISTER, { identifier }, PUBLIC_CONFIG),
    'Failed to start identification. Please try again.',
  );

export const IdentifyVerifyOtp = (identifier: string, otp: string) =>
  handleRequest<ApiResponse<unknown>>(
    () => postData<ApiResponse<unknown>>(Api.IDENTIFY_VERIFY_OTP, { identifier, otp }, PUBLIC_CONFIG),
    'Failed to verify OTP. Please try again.',
  );

export const SaveProfile = (data: Record<string, unknown>) =>
  handleRequest<ApiResponse<unknown>>(
    () => putData<ApiResponse<unknown>>(Api.SAVE_PROFILE, data),
    'Unable to save profile. Please try again.',
  );

export const SaveKyc = (data: Record<string, unknown>) =>
  handleRequest<ApiResponse<unknown>>(
    () => putData<ApiResponse<unknown>>(Api.SAVE_KYC, data),
    'Unable to save KYC. Please try again.',
  );

export const SavePermission = (data: Record<string, unknown>) =>
  handleRequest<ApiResponse<unknown>>(
    () => putData<ApiResponse<unknown>>(Api.SAVE_PERMISSION, data),
    'Unable to save permissions. Please try again.',
  );

export const GetProfile = () =>
  handleRequest<ApiResponse<unknown>>(
    () => getData<ApiResponse<unknown>>(Api.SAVE_PROFILE),
    'Unable to fetch profile. Please try again.',
  );
