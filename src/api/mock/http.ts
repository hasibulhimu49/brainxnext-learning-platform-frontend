import type { ApiEnvelope } from "../envelope";

/** What a mock handler returns: an HTTP status plus a body in the common envelope. */
export interface MockResult {
  status: number;
  body: ApiEnvelope<unknown>;
}

export interface MockRequest {
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  /** Bearer token from the Authorization header, if any */
  token: string | null;
}

export type MockHandler = (req: MockRequest) => MockResult | Promise<MockResult>;

export interface MockRoute {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Express-style path, e.g. "/courses/:id" */
  path: string;
  handler: MockHandler;
}

export const ok = <T>(data: T, status = 200, message?: string): MockResult => ({
  status,
  body: message ? { success: true, data, message } : { success: true, data },
});

export const fail = (status: number, code: string, message: string, details?: unknown): MockResult => ({
  status,
  body: { success: false, error: details === undefined ? { code, message } : { code, message, details } },
});

/** Read a JSON body as a loose record so handlers can pick typed fields safely. */
export const bodyOf = (req: MockRequest): Record<string, unknown> =>
  req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};

export const str = (v: unknown): string => (typeof v === "string" ? v : "");
