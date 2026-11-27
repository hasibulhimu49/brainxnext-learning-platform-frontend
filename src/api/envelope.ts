import { z } from "zod";

/**
 * The common response envelope every BrainXNext API endpoint returns.
 *
 *   { "success": true,  "data": { ... }, "message"?: "..." }
 *   { "success": false, "error": { "code": "EMAIL_TAKEN", "message": "...", "details"?: ... } }
 *
 * UI code never sees the envelope: services call `request()` (src/api/client.ts), which checks
 * `success` first and either returns `data` or throws an `ApiError`.
 */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

const envelopeSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), data: z.unknown(), message: z.string().optional() }),
  z.object({
    success: z.literal(false),
    error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
  }),
]);

/** Well-known error codes the UI branches on. The backend may send others. */
export const API_ERROR_CODES = {
  network: "NETWORK_ERROR",
  invalidEnvelope: "INVALID_ENVELOPE",
  invalidResponse: "INVALID_RESPONSE",
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  notFound: "NOT_FOUND",
  validation: "VALIDATION_ERROR",
  userNotFound: "USER_NOT_FOUND",
  wrongPassword: "WRONG_PASSWORD",
  emailTaken: "EMAIL_TAKEN",
  invalidCode: "INVALID_CODE",
  invalidPromo: "INVALID_PROMO",
  emailNotVerified: "EMAIL_NOT_VERIFIED",
  noPendingSignup: "NO_PENDING_SIGNUP",
  invalidResetToken: "INVALID_RESET_TOKEN",
  paymentRequired: "PAYMENT_REQUIRED",
  alreadyEnrolled: "ALREADY_ENROLLED",
  notEnrolled: "NOT_ENROLLED",
  // F-002 Phase 2 (provisional)
  paymentDeclined: "PAYMENT_DECLINED",
  orderNotPending: "ORDER_NOT_PENDING",
  alreadySubscribed: "ALREADY_SUBSCRIBED",
  upgradeRequired: "UPGRADE_REQUIRED",
  refundNotAllowed: "REFUND_NOT_ALLOWED",
  // F-006 (provisional)
  reviewTooEarly: "REVIEW_TOO_EARLY",
  // admin (provisional)
  noRefundRequest: "NO_REFUND_REQUEST",
  promoExists: "PROMO_EXISTS",
  /** the server (or the mock) failed unexpectedly */
  internal: "INTERNAL_ERROR",
} as const;

export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly code: string;
  readonly status: number | undefined;
  readonly details: unknown;

  constructor(code: string, message: string, status?: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** Human-readable message for any thrown value (for inline alerts). */
export const errorMessage = (e: unknown, fallback = "Something went wrong. Please try again.") => (isApiError(e) ? e.message : fallback);

/** Returns the parsed envelope, or null when the body is not an envelope at all. */
export const parseEnvelope = (body: unknown): ApiEnvelope<unknown> | null => {
  const parsed = envelopeSchema.safeParse(body);
  return parsed.success ? parsed.data : null;
};

/**
 * Check `success`, then read `data`. Throws ApiError on failure envelopes or malformed bodies.
 * Pass a Zod schema to validate the payload at runtime as well.
 */
export function unwrap<T>(body: unknown, status?: number, schema?: z.ZodType<T>): T {
  const envelope = parseEnvelope(body);
  if (!envelope) {
    throw new ApiError(API_ERROR_CODES.invalidEnvelope, "The server sent an unexpected response.", status);
  }
  if (!envelope.success) {
    throw new ApiError(envelope.error.code, envelope.error.message, status, envelope.error.details);
  }
  if (schema) {
    const result = schema.safeParse(envelope.data);
    if (!result.success) {
      throw new ApiError(API_ERROR_CODES.invalidResponse, "The server sent data in an unexpected shape.", status, result.error.issues);
    }
    return result.data;
  }
  // Without a schema, the payload type is the endpoint's documented contract (see src/services).
  return envelope.data as T;
}
