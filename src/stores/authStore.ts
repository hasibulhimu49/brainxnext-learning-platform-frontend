import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AuthSession, SessionUser } from "@/types/auth";

/**
 * Auth state — owned by this store, and only this store.
 *
 * Holds the client-side session (token + who is signed in), the in-progress sign-up email
 * that the OTP / reset screens need, and the "remember me" choice. It does NOT cache server
 * data: profile details, courses, dashboards etc. are fetched through TanStack Query.
 *
 * Writers: the auth mutations in src/queries/auth.ts, useUpdateProfile (name sync) and the
 * 401 interceptor in src/api/client.ts (expireSession).
 */
interface AuthState {
  token: string | null;
  user: SessionUser | null;
  /** email waiting for OTP verification / password reset */
  pendingEmail: string | null;
  /** true → the session survives closing the browser (localStorage); false → this tab only (sessionStorage) */
  remember: boolean;
  /** set when a 401 ended an existing session, so the login page can say why (not persisted) */
  sessionExpired: boolean;
  setSession: (session: AuthSession, remember?: boolean) => void;
  updateUser: (patch: Partial<SessionUser>) => void;
  clearSession: () => void;
  /** a 401 arrived: drop the session and flag it as expired — only if there was one */
  expireSession: () => void;
  setPendingEmail: (email: string | null) => void;
}

export const AUTH_STORAGE_KEY = "bxn-auth";

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback; // storage unavailable (private mode, blocked cookies)
  }
};

/**
 * Persist to localStorage when the user ticked "Remember me", otherwise to sessionStorage, and
 * remove the copy from the other storage so only one exists at a time.
 */
const rememberAwareStorage: StateStorage = {
  getItem: (name) => safe(() => localStorage.getItem(name) ?? sessionStorage.getItem(name), null),
  setItem: (name, value) =>
    safe(() => {
      const parsed: unknown = JSON.parse(value);
      const state = parsed && typeof parsed === "object" && "state" in parsed ? (parsed as { state: Partial<AuthState> }).state : {};
      const [keep, drop] = state.remember === false ? [sessionStorage, localStorage] : [localStorage, sessionStorage];
      keep.setItem(name, value);
      drop.removeItem(name);
    }, undefined),
  removeItem: (name) =>
    safe(() => {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    }, undefined),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      pendingEmail: null,
      remember: true,
      sessionExpired: false,
      setSession: ({ token, user }, remember = true) => set({ token, user, remember, sessionExpired: false }),
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      clearSession: () => set({ token: null, user: null, pendingEmail: null, sessionExpired: false }),
      expireSession: () => set((s) => (s.token ? { token: null, user: null, sessionExpired: true } : s)),
      setPendingEmail: (pendingEmail) => set({ pendingEmail }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => rememberAwareStorage),
      partialize: ({ token, user, pendingEmail, remember }) => ({ token, user, pendingEmail, remember }),
    }
  )
);

export const useSessionUser = () => useAuthStore((s) => s.user);
export const useIsSignedIn = () => useAuthStore((s) => s.token !== null);
