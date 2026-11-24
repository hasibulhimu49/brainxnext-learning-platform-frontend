export type UserRole = "student" | "admin";

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}

/** POST /auth/forgot-password response */
export interface ForgotPasswordResult {
  sentTo: string;
  /**
   * MOCK ONLY — the demo has no email inbox, so the mock returns the reset link it would have
   * emailed (only for existing accounts). A real backend never sends this.
   */
  devResetLink?: string;
}
