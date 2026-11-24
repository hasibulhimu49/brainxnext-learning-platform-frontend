import type { UserRole } from "@/types/auth";

/** Only internal paths are allowed as a post-login target ("/x", never "//evil.com" or "https://…"). */
export const safeNext = (next: string | null | undefined): string | null =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;

/** Where a signed-in user lands by default. */
export const homeFor = (role: UserRole | undefined) => (role === "admin" ? "/admin" : "/dashboard");

/** /login?next=<path>[&reason=expired] */
export const loginPath = (next: string, expired = false) => {
  const params = new URLSearchParams({ next });
  if (expired) params.set("reason", "expired");
  return `/login?${params.toString()}`;
};
