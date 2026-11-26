import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { addUser } from "@/api/mock/db/users";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import Login from "./Login";

const fill = async (email: string, password: string, { remember = true } = {}) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email address"), email);
  await user.type(screen.getByLabelText("Password"), password);
  if (!remember) await user.click(screen.getByLabelText("Remember me"));
  await user.click(screen.getByRole("button", { name: "Log in" }));
};

describe("<Login />", () => {
  it("shows validation messages for an empty submit", async () => {
    renderWithProviders(<Login />, { route: "/login" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText("Enter your email address")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
  });

  it("shows the server error for a wrong password", async () => {
    renderWithProviders(<Login />, { route: "/login" });
    await fill("hasibulx26@gmail.com", "wrong-password");
    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong password. Try again or reset it below.");
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("signs a student in and goes straight to the dashboard", async () => {
    renderWithProviders(<Login />, { route: "/login" });
    await fill("hasibulx26@gmail.com", "12345678");
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    expect(useAuthStore.getState().user?.name).toBe("Mohammad Hasibul Hasan");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain("mock.");
  });

  it("sends admins to /admin by default", async () => {
    renderWithProviders(<Login />, { route: "/login", stubs: ["/admin"] });
    await fill("admin@brainxnext.com", "admin12345");
    expect(await screen.findByText("Stub: /admin /admin")).toBeInTheDocument();
  });

  it("honours an internal ?next= and explains why the user is here", async () => {
    renderWithProviders(<Login />, { route: "/login?next=%2Fcheckout%2Fapplied-ml", stubs: ["/checkout/:courseId"] });
    expect(screen.getByRole("status")).toHaveTextContent("Log in to finish your purchase");
    await fill("hasibulx26@gmail.com", "12345678");
    expect(await screen.findByText("Stub: /checkout/:courseId /checkout/applied-ml")).toBeInTheDocument();
  });

  it("ignores an external ?next=", async () => {
    renderWithProviders(<Login />, { route: "/login?next=%2F%2Fevil.com" });
    await fill("hasibulx26@gmail.com", "12345678");
    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
  });

  it("shows the session-expired notice", () => {
    renderWithProviders(<Login />, { route: "/login?reason=expired&next=%2Fdashboard" });
    expect(screen.getByRole("status")).toHaveTextContent("Your session expired — please log in again.");
  });

  it("keeps the session for this tab only when Remember me is unticked", async () => {
    renderWithProviders(<Login />, { route: "/login" });
    await fill("hasibulx26@gmail.com", "12345678", { remember: false });
    await screen.findByText("Dashboard page");
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toContain("mock.");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("asks an unverified account to verify first and remembers the email for the OTP screen", async () => {
    addUser({ name: "New Learner", email: "new@email.com", password: "password123" });
    renderWithProviders(<Login />, { route: "/login" });
    await fill("new@email.com", "password123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Please verify your email first.");
    expect(screen.getByRole("link", { name: "Enter your code" })).toHaveAttribute("href", "/verify-otp");
    expect(useAuthStore.getState().pendingEmail).toBe("new@email.com");
    expect(useAuthStore.getState().token).toBeNull();
  });
});
