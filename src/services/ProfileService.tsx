import { getData, postData, putData } from '../api/apiClient';
import { Api } from '../config/apiConstant';
import { toast } from '../utils/Toast';
import { extractErrorMessage } from '../utils/Helper';
import { ApiResponse, RequestConfig } from '../types/types';


const PUBLIC_CONFIG = { skipAuth: true } as RequestConfig;

async function handleRequest<T>(
  fn: () => Promise<ApiResponse<T>>,
  fallback = 'Something went wrong. Please try again.',
): Promise<ApiResponse<T>> {
  try {
    return (await fn()) as ApiResponse<T>;
  } catch (err: unknown) {
    const msg = extractErrorMessage(err);
    toast.error(msg);
    throw err;
  }
}

export const SignOut = () =>
  handleRequest(() => postData(Api.LOGOUT), 'Unable to sign out. Please try again.');

export const IdentifyRegister = (identifier: string) =>
  handleRequest(
    () => postData(Api.IDENTIFY_REGISTER, { identifier }, PUBLIC_CONFIG),
    'Failed to start identification. Please try again.',
  );

export const IdentifyVerifyOtp = (identifier: string, otp: string) =>
  handleRequest(
    () => postData(Api.IDENTIFY_VERIFY_OTP, { identifier, otp }, PUBLIC_CONFIG),
    'Failed to verify OTP. Please try again.',
  );

export const SaveProfile = (data: unknown) =>
  handleRequest(() => putData(Api.SAVE_PROFILE, data), 'Unable to save profile. Please try again.');

export const SaveKyc = (data: unknown) =>
  handleRequest(() => putData(Api.SAVE_KYC, data), 'Unable to save KYC. Please try again.');

export const SavePermission = (data: unknown) =>
  handleRequest(
    () => putData(Api.SAVE_PERMISSION, data),
    'Unable to save permissions. Please try again.',
  );

export const GetProfile = () =>
  handleRequest(() => getData(Api.SAVE_PROFILE), 'Unable to fetch profile. Please try again.');


