import axios, { type AxiosRequestConfig } from "axios";
import type { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL, USE_MOCK_API } from "./config";
import { API_ERROR_CODES, ApiError, parseEnvelope, unwrap } from "./envelope";
import { mockAdapter } from "./mock/adapter";

/**
 * The single Axios instance for the app. Only src/api and src/services may use it —
 * UI components get data through the TanStack Query hooks in src/queries.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
  ...(USE_MOCK_API ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

apiClient.interceptors.response.use(undefined, (error: unknown) => {
  // A rejected token means the session is over — drop it and flag it as expired, so the route
  // guards send the user to /login?reason=expired (only when a session existed).
  if (axios.isAxiosError(error) && error.response?.status === 401) useAuthStore.getState().expireSession();
  return Promise.reject(error);
});

/** Send a request and return the envelope's `data`, or throw ApiError. */
export async function request<T>(config: AxiosRequestConfig, schema?: z.ZodType<T>): Promise<T> {
  try {
    const res = await apiClient.request<unknown>(config);
    return unwrap(res.data, res.status, schema);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const envelope = err.response ? parseEnvelope(err.response.data) : null;
      if (envelope && !envelope.success) {
        throw new ApiError(envelope.error.code, envelope.error.message, status, envelope.error.details);
      }
      if (!err.response) throw new ApiError(API_ERROR_CODES.network, "Can't reach the server. Check your connection and try again.");
      throw new ApiError(`HTTP_${status ?? 0}`, err.message, status);
    }
    throw err;
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig, schema?: z.ZodType<T>) => request<T>({ ...config, method: "GET", url }, schema),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig, schema?: z.ZodType<T>) =>
    request<T>({ ...config, method: "POST", url, data }, schema),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig, schema?: z.ZodType<T>) =>
    request<T>({ ...config, method: "PUT", url, data }, schema),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig, schema?: z.ZodType<T>) =>
    request<T>({ ...config, method: "PATCH", url, data }, schema),
  delete: <T>(url: string, config?: AxiosRequestConfig, schema?: z.ZodType<T>) => request<T>({ ...config, method: "DELETE", url }, schema),
};
