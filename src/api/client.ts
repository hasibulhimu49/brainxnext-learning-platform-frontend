import axios, { type AxiosAdapter, type AxiosRequestConfig } from "axios";
import type { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL, USE_MOCK_API } from "./config";
import { API_ERROR_CODES, ApiError, parseEnvelope, unwrap } from "./envelope";

/**
 * The mock API (and its whole demo database) is loaded on demand, so it is a separate chunk and
 * builds with VITE_USE_MOCK_API=false never download it. Requests sent before it has loaded simply
 * wait for the import. The import starts as soon as this module loads (in parallel with the first
 * render) and the promise is shared by every request.
 * The condition repeats USE_MOCK_API inline on purpose: Rollup only drops the import (and the mock
 * chunk) from VITE_USE_MOCK_API=false builds when the env check sits right here.
 */
const mockAdapterPromise: Promise<AxiosAdapter> | null =
  import.meta.env.VITE_USE_MOCK_API !== "false" ? import("./mock/adapter").then((m) => m.mockAdapter) : null;
const lazyMockAdapter: AxiosAdapter = async (config) => {
  if (!mockAdapterPromise) throw new Error("Mock API is disabled");
  const adapter = await mockAdapterPromise;
  return adapter(config);
};

/**
 * The single Axios instance for the app. Only src/api and src/services may use it —
 * UI components get data through the TanStack Query hooks in src/queries.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
  ...(USE_MOCK_API ? { adapter: lazyMockAdapter } : {}),
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
