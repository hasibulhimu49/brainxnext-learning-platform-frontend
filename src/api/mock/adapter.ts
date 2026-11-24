import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { fail, type MockRequest, type MockResult, type MockRoute } from "./http";
import { routes } from "./routes/index";

/**
 * In-browser stand-in for the BrainXNext backend. It is plugged into the shared Axios instance
 * as its adapter, so requests still go through interceptors and the envelope check exactly as
 * they will against the real API. Disable with VITE_USE_MOCK_API=false.
 */
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 250;

const compile = (path: string) => {
  const keys: string[] = [];
  const pattern = path.replace(/:(\w+)/g, (_, key: string) => {
    keys.push(key);
    return "([^/]+)";
  });
  return { regex: new RegExp(`^${pattern}/?$`), keys };
};

const compiled = routes.map((r) => ({ ...r, ...compile(r.path) }));

const match = (method: string, path: string): { route: MockRoute; params: Record<string, string> } | null => {
  for (const r of compiled) {
    if (r.method !== method) continue;
    const m = r.regex.exec(path);
    if (!m) continue;
    const params: Record<string, string> = {};
    r.keys.forEach((k, i) => {
      params[k] = decodeURIComponent(m[i + 1] ?? "");
    });
    return { route: r, params };
  }
  return null;
};

const parseBody = (data: unknown): unknown => {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const relativePath = (config: InternalAxiosRequestConfig) => {
  const url = new URL(config.url ?? "", "http://mock.local");
  return { path: url.pathname.replace(/^\/api\/v1/, ""), query: url.searchParams };
};

const tokenOf = (config: InternalAxiosRequestConfig) => {
  const auth = AxiosHeaders.from(config.headers).get("Authorization");
  return typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
};

export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? "get").toUpperCase();
  const { path, query } = relativePath(config);
  const found = match(method, path);

  let result: MockResult;
  if (!found) {
    result = fail(404, "NOT_FOUND", `No mock route for ${method} ${path}`);
  } else {
    const req: MockRequest = { params: found.params, query, body: parseBody(config.data), token: tokenOf(config) };
    try {
      result = await found.route.handler(req);
    } catch (e) {
      result = fail(500, "INTERNAL_ERROR", e instanceof Error ? e.message : "Mock handler crashed");
    }
  }

  if (LATENCY_MS) await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  const response: AxiosResponse = {
    data: result.body,
    status: result.status,
    statusText: String(result.status),
    headers: new AxiosHeaders({ "content-type": "application/json" }),
    config,
    request: {},
  };

  const valid = config.validateStatus ? config.validateStatus(result.status) : result.status >= 200 && result.status < 300;
  if (!valid) {
    const code = result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST;
    throw new AxiosError(`Request failed with status code ${result.status}`, code, config, response.request, response);
  }
  return response;
};
