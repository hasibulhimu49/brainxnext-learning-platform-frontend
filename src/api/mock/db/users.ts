import type { SessionUser, UserRole } from "@/types/auth";
import type { NotificationPreferences, Profile } from "@/types/account";

/** Server-side user records for the mock API (persisted in localStorage so a reload keeps sign-ups). */
interface MockUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  verified: boolean;
  bio: string;
  portfolio: string;
  goal: string;
  /** F-002 Phase 2 (all optional so older stored users still load) */
  prefs?: NotificationPreferences;
  /** ids of notifications the user has read */
  readNotifications?: string[];
  /** new address waiting for OTP confirmation (email change) */
  pendingEmail?: string | null;
  /** ISO timestamp the account was created */
  createdAt?: string;
}

const STORAGE_KEY = "bxn-mock-users";

const SEED: MockUser[] = [
  {
    name: "Mohammad Hasibul Hasan",
    email: "hasibulx26@gmail.com",
    password: "password123",
    role: "student",
    verified: true,
    bio: "",
    portfolio: "brainxnext.com/u/hasibul",
    goal: "Backend developer role by 2027",
    createdAt: "2026-03-02T09:00:00.000Z",
  },
  {
    name: "BrainXNext Admin",
    email: "admin@brainxnext.com",
    password: "admin12345",
    role: "admin",
    verified: true,
    bio: "",
    portfolio: "",
    goal: "",
  },
];

let memory: MockUser[] | null = null;

const load = (): MockUser[] => {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    memory = Array.isArray(parsed) && parsed.length ? (parsed as MockUser[]) : [...SEED];
  } catch {
    memory = [...SEED];
  }
  return memory;
};

const save = (users: MockUser[]) => {
  memory = users;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    /* storage unavailable — keep in memory */
  }
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const findUser = (email: string) => load().find((u) => same(u.email, email));

export const addUser = (user: Pick<MockUser, "name" | "email" | "password">) =>
  save([...load(), { ...user, role: "student", verified: false, bio: "", portfolio: "", goal: "", createdAt: new Date().toISOString() }]);

export const updateUser = (email: string, patch: Partial<MockUser>) =>
  save(load().map((u) => (same(u.email, email) ? { ...u, ...patch } : u)));

/** Delete an account (DELETE /me). */
export const removeUser = (email: string) => save(load().filter((u) => !same(u.email, email)));

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  courseUpdates: true,
  assignments: true,
  recommendations: true,
  community: true,
  digest: "Weekly",
  desktop: true,
};

export const preferencesOf = (email: string): NotificationPreferences => ({ ...DEFAULT_PREFERENCES, ...findUser(email)?.prefs });

export const readNotificationsOf = (email: string) => new Set(findUser(email)?.readNotifications ?? []);

export const toSessionUser = (u: MockUser): SessionUser => ({ name: u.name, email: u.email, role: u.role });

export const toProfile = (u: MockUser): Profile => ({
  name: u.name,
  email: u.email,
  bio: u.bio,
  portfolio: u.portfolio,
  goal: u.goal,
  memberSince: u.createdAt ?? null,
});

/** Mock tokens just encode the email — the real backend issues JWTs. */
export const issueToken = (email: string) => `mock.${btoa(email)}`;

export const userFromToken = (token: string | null) => {
  if (!token?.startsWith("mock.")) return undefined;
  try {
    return findUser(atob(token.slice(5)));
  } catch {
    return undefined;
  }
};

/* ---------------- password reset tokens ---------------- */

const RESET_KEY = "bxn-mock-reset-tokens";
const RESET_TTL_MS = 30 * 60 * 1000;

interface ResetToken {
  email: string;
  expiresAt: number;
}

const loadTokens = (): Record<string, ResetToken> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RESET_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, ResetToken>) : {};
  } catch {
    return {};
  }
};

const saveTokens = (tokens: Record<string, ResetToken>) => {
  try {
    localStorage.setItem(RESET_KEY, JSON.stringify(tokens));
  } catch {
    /* storage unavailable */
  }
};

/** Create a single-use reset token for an existing account (30-minute lifetime). */
export const issueResetToken = (email: string, now = Date.now()) => {
  const token = `rst_${Math.random().toString(36).slice(2)}${now.toString(36)}`;
  saveTokens({ ...loadTokens(), [token]: { email: email.trim().toLowerCase(), expiresAt: now + RESET_TTL_MS } });
  return token;
};

/** Returns the email the token belongs to and burns the token; undefined when missing or expired. */
export const consumeResetToken = (token: string, now = Date.now()) => {
  const tokens = loadTokens();
  const entry = tokens[token];
  if (!entry) return undefined;
  const { [token]: _used, ...rest } = tokens;
  saveTokens(rest);
  return entry.expiresAt > now ? entry.email : undefined;
};

/** Test helper: forget every sign-up and reset token and go back to the seed users. */
export const resetMockUsers = () => {
  save([...SEED]);
  saveTokens({});
};
