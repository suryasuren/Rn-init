import api from "./api";
import { AxiosRequestConfig } from "axios";

export type ApiData<T = unknown> = T;

export const getData = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiData<T>> => {
  const res = await api.get<T>(url, config);
  return res.data;
};

export const postData = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiData<T>> => {
  const res = await api.post<T>(url, body, config);
  return res.data;
};

export const putData = async <T = unknown>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiData<T>> => {
  const res = await api.put<T>(url, body, config);
  return res.data;
};

export const deleteData = async <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiData<T>> => {
  const res = await api.delete<T>(url, config);
  return res.data;
};
