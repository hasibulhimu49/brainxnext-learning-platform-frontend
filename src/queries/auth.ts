import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_ERROR_CODES, isApiError } from "@/api/envelope";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { queryKeys } from "./keys";

/** The auth mutations are the only writers of the session in the auth store. */

interface LoginVariables {
  email: string;
  password: string;
  /** keep the session after the browser closes (default true) */
  remember?: boolean;
}

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  return useMutation({
    mutationFn: ({ email, password }: LoginVariables) => authService.login(email, password),
    onSuccess: (session, { remember = true }) => setSession(session, remember),
    // an unverified account is sent to the OTP screen, which needs to know the email
    onError: (error, { email }) => {
      if (isApiError(error) && error.code === API_ERROR_CODES.emailNotVerified) setPendingEmail(email.trim());
    },
  });
};

export const useRegister = () => {
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      authService.register(name, email, password),
    onSuccess: ({ email }) => setPendingEmail(email),
  });
};

export const useVerifyOtp = () => {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.verifyOtp(email, code),
    onSuccess: (session) => setSession(session),
  });
};

export const useResendOtp = () => useMutation({ mutationFn: authService.resendOtp });

export const useForgotPassword = () => {
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: ({ sentTo }) => setPendingEmail(sentTo),
  });
};

export const useResetPassword = () =>
  useMutation({ mutationFn: ({ token, password }: { token: string; password: string }) => authService.resetPassword(token, password) });

interface LogoutState {
  loggedOut?: boolean;
  /** toast text (default "You've been logged out") */
  message?: string;
}

/**
 * Sign out: go home first, then (see useLogoutListener) drop the session and pending sign-up
 * email, forget every cached server response — user-scoped and admin data included — and toast.
 * The session is cleared only once "/" has rendered: router navigations are transitions, so
 * clearing it right away would let the current page's guard redirect to /login?next=… first.
 */
export const useLogout = (message?: string) => {
  const navigate = useNavigate();
  return () => navigate("/", { state: { loggedOut: true, message } satisfies LogoutState });
};

/** Forget every cached response that belongs to a signed-in user (learner and admin data). */
export const removeUserScopedQueries = (qc: QueryClient) => {
  qc.removeQueries({ queryKey: queryKeys.me.all });
  qc.removeQueries({ queryKey: queryKeys.admin.all });
};

/**
 * Drop user-scoped cache whenever the session changes hands: a 401 expired it, or someone signed
 * in (login / OTP) — possibly a different user than the one whose data is cached. Otherwise the
 * previous account's dashboard, orders or admin lists could show for up to a minute (staleTime).
 * A token swap within a session (email change) keeps the cache; that flow refetches it itself.
 * Returns the unsubscribe function.
 */
export const watchSessionChanges = (qc: QueryClient) =>
  useAuthStore.subscribe((state, prev) => {
    const expired = state.sessionExpired && !prev.sessionExpired;
    const signedIn = !!state.token && !prev.token;
    if (expired || signedIn) removeUserScopedQueries(qc);
  });

/** Mounted once in App: finishes a logout after the navigation to "/" has committed, and clears another user's cache. */
export const useLogoutListener = () => {
  const qc = useQueryClient();
  useEffect(() => watchSessionChanges(qc), [qc]);
  const navigate = useNavigate();
  const location = useLocation();
  const clearSession = useAuthStore((s) => s.clearSession);
  const state = location.state as LogoutState | null;
  const loggedOut = state?.loggedOut === true;
  const message = state?.message ?? "You've been logged out";
  useEffect(() => {
    if (!loggedOut) return;
    clearSession();
    qc.clear();
    toast(message);
    navigate(location.pathname, { replace: true, state: null });
  }, [loggedOut, message, clearSession, qc, navigate, location.pathname]);
};
