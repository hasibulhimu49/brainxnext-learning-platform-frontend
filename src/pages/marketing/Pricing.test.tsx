import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { COURSES } from "@/api/mock/db/courses";
import { PRO_YEARLY_SAVING_PCT } from "@/constants/plans";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import Pricing from "./Pricing";

describe("<Pricing />", { timeout: 15000 }, () => {
  afterEach(() => useAuthStore.getState().clearSession());

  it("counts courses from the catalog and badges the real yearly saving", async () => {
    renderWithProviders(<Pricing />, { route: "/pricing" });
    const free = COURSES.filter((c) => c.free).length;
    expect(await screen.findByText(`${free} free courses, every lesson`, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(`All ${COURSES.length} courses, free and paid`)).toBeInTheDocument();
    expect(PRO_YEARLY_SAVING_PCT).toBe(26);
    expect(screen.getByRole("button", { name: /Yearly/ })).toHaveTextContent("−26%");
  });

  it("states the Teams price per seat per month in both cycles", async () => {
    renderWithProviders(<Pricing />, { route: "/pricing" });
    expect(screen.getByText("per seat / month")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Yearly/ }));
    expect(screen.getByText("per seat / month")).toBeInTheDocument();
    expect(screen.getByText("/ month, billed yearly")).toBeInTheDocument();
  });

  it("shows guests the sign-up CTA and signed-in users the dashboard", async () => {
    const { unmount } = renderWithProviders(<Pricing />, { route: "/pricing" });
    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "/register");
    unmount();

    useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
    renderWithProviders(<Pricing />, { route: "/pricing" });
    expect(screen.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: "Start free" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Create a free account/ })).not.toBeInTheDocument();
  });
});
