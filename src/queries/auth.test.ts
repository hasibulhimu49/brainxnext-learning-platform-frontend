import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { watchSessionChanges } from "./auth";
import { queryKeys } from "./keys";

const STUDENT = { token: "t-1", user: { name: "Student", email: "student@example.com", role: "student" as const } };
const OTHER = { token: "t-2", user: { name: "Other", email: "other@example.com", role: "student" as const } };

let stop: () => void = () => undefined;
afterEach(() => stop());

const fill = (qc: QueryClient) => {
  qc.setQueryData(queryKeys.me.dashboard, { mine: true });
  qc.setQueryData(queryKeys.admin.overview, { kpis: [] });
  qc.setQueryData(queryKeys.courses.all, []);
};

describe("watchSessionChanges", () => {
  it("drops user and admin data when a 401 expires the session, keeps public data", () => {
    const qc = new QueryClient();
    useAuthStore.getState().setSession(STUDENT);
    stop = watchSessionChanges(qc);
    fill(qc);
    useAuthStore.getState().expireSession();
    expect(qc.getQueryData(queryKeys.me.dashboard)).toBeUndefined();
    expect(qc.getQueryData(queryKeys.admin.overview)).toBeUndefined();
    expect(qc.getQueryData(queryKeys.courses.all)).toEqual([]);
  });

  it("drops the previous user's data when someone signs in", () => {
    const qc = new QueryClient();
    stop = watchSessionChanges(qc);
    fill(qc);
    useAuthStore.getState().setSession(OTHER);
    expect(qc.getQueryData(queryKeys.me.dashboard)).toBeUndefined();
    expect(qc.getQueryData(queryKeys.admin.overview)).toBeUndefined();
  });

  it("keeps the cache for changes within a session (name, token swap)", () => {
    const qc = new QueryClient();
    useAuthStore.getState().setSession(STUDENT);
    stop = watchSessionChanges(qc);
    fill(qc);
    useAuthStore.getState().updateUser({ name: "Renamed" });
    useAuthStore.getState().setSession({ ...STUDENT, token: "t-3" });
    expect(qc.getQueryData(queryKeys.me.dashboard)).toEqual({ mine: true });
  });
});
