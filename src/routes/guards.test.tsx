import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import type { SessionUser } from "@/types/auth";
import { GuestOnly, RequireAuth, RequireRole } from "./guards";
import { safeNext } from "./redirects";

const Where = ({ label }: { label: string }) => {
  const { pathname, search } = useLocation();
  return <div>{`${label} ${pathname}${search}`}</div>;
};

const student: SessionUser = { name: "Stu Dent", email: "s@email.com", role: "student" };
const admin: SessionUser = { name: "Ad Min", email: "a@email.com", role: "admin" };
const signIn = (user: SessionUser) => useAuthStore.setState({ token: "mock.x", user });

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Where label="dashboard" />} />
        </Route>
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<Where label="admin" />} />
        </Route>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Where label="login" />
            </GuestOnly>
          }
        />
        <Route path="/settings" element={<Where label="settings" />} />
      </Routes>
    </MemoryRouter>
  );

describe("route guards", () => {
  it("RequireAuth sends guests to login with the page they wanted", () => {
    renderAt("/dashboard?tab=1");
    expect(screen.getByText("login /login?next=%2Fdashboard%3Ftab%3D1")).toBeInTheDocument();
  });

  it("RequireAuth adds reason=expired after a 401 ended the session", () => {
    signIn(student);
    useAuthStore.getState().expireSession();
    renderAt("/dashboard");
    expect(screen.getByText("login /login?next=%2Fdashboard&reason=expired")).toBeInTheDocument();
  });

  it("RequireAuth renders the page for a signed-in user", () => {
    signIn(student);
    renderAt("/dashboard");
    expect(screen.getByText("dashboard /dashboard")).toBeInTheDocument();
  });

  it("RequireRole shows the 403 page to a student", async () => {
    signIn(student);
    renderAt("/admin");
    expect(await screen.findByRole("heading", { name: "This area is for admins" })).toBeInTheDocument();
  });

  it("RequireRole sends guests to login and lets admins in", () => {
    renderAt("/admin");
    expect(screen.getByText("login /login?next=%2Fadmin")).toBeInTheDocument();
  });

  it("RequireRole renders the page for an admin", () => {
    signIn(admin);
    renderAt("/admin");
    expect(screen.getByText("admin /admin")).toBeInTheDocument();
  });

  it("GuestOnly redirects signed-in users to their home or ?next=", () => {
    signIn(admin);
    renderAt("/login");
    expect(screen.getByText("admin /admin")).toBeInTheDocument();
  });

  it("GuestOnly honours a safe ?next=", () => {
    signIn(student);
    renderAt("/login?next=%2Fsettings");
    expect(screen.getByText("settings /settings")).toBeInTheDocument();
  });

  it("safeNext only allows internal paths", () => {
    expect(safeNext("/learn/java-generics")).toBe("/learn/java-generics");
    expect(safeNext("//evil.com")).toBeNull();
    expect(safeNext("https://evil.com")).toBeNull();
    expect(safeNext(null)).toBeNull();
  });
});
