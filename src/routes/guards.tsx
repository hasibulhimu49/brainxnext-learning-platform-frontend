import { lazy, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { OPEN_ADMIN } from "@/api/config";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/auth";
import { homeFor, loginPath, safeNext } from "./redirects";

const Forbidden = lazy(() => import("@/pages/Forbidden"));

/*
 * Route guards. They only shape the experience — the backend (here: the mock API) still checks
 * the token and role on every request. Each renders `children` when given, else an <Outlet />.
 */

/** No session → /login?next=<current path + search> (plus reason=expired after a 401). */
export const RequireAuth = ({ children }: { children?: ReactNode }) => {
  const signedIn = useAuthStore((s) => s.token !== null);
  const expired = useAuthStore((s) => s.sessionExpired);
  const { pathname, search } = useLocation();
  if (!signedIn) return <Navigate to={loginPath(pathname + search, expired)} replace />;
  return <>{children ?? <Outlet />}</>;
};

/** Guests go to login; signed-in users without the role see the 403 page. */
export const RequireRole = ({ role, children }: { role: UserRole; children?: ReactNode }) => {
  const userRole = useAuthStore((s) => s.user?.role);
  // demo mode: the admin panel is open to everyone while the mock API stands in for the backend
  if (OPEN_ADMIN && role === "admin") return <>{children ?? <Outlet />}</>;
  return <RequireAuth>{userRole === role ? (children ?? <Outlet />) : <Forbidden />}</RequireAuth>;
};

/**
 * Keeps signed-in users off the guest screens (login, register, OTP, forgot password): they go to
 * `?next=` or their home (/admin or /dashboard). Only checked when the screen opens, so a screen
 * that signs the user in (login, OTP) can show its own success state and navigate itself.
 */
export const GuestOnly = ({ children }: { children: ReactNode }) => {
  const state = useAuthStore.getState();
  const [signedInOnArrival] = useState(() => state.token !== null);
  const [params] = useSearchParams();
  if (signedInOnArrival) return <Navigate to={safeNext(params.get("next")) ?? homeFor(state.user?.role)} replace />;
  return <>{children}</>;
};
