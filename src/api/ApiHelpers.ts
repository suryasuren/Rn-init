import { ApiError, ApiResponse } from "./apiTypes";

export const unwrap = <T>(res: ApiResponse<T> | null | undefined): T => {
  if (!res) throw new ApiError('No response from server', res);
  if (typeof res.code !== 'undefined' && res.code !== 200) {
    const message = res.message ?? 'Server error';
    throw new ApiError(message, res);
  }
  if (typeof res.data === 'undefined') throw new ApiError('Response does not contain data', res);
  return res.data as T;
};