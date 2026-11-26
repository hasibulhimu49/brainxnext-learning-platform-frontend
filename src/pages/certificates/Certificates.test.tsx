import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import Certificates from "./Certificates";

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
});

describe("<Certificates />", () => {
  it("lists the learner's certificates", async () => {
    renderWithProviders(<Certificates />, { route: "/certificates", path: "/certificates" });
    expect(await screen.findByText("SQL From Query to Model")).toBeInTheDocument();
    expect(screen.getByText("BXN-2026-SQ-08412")).toBeInTheDocument();
    expect(screen.getByText("2 certificates earned")).toBeInTheDocument();
  });

  it("shows the empty state for a learner without certificates", async () => {
    await authService.register("Fresh", "fresh@mail.com", "password123");
    useAuthStore.getState().setSession(await authService.verifyOtp("fresh@mail.com", "123456"));
    renderWithProviders(<Certificates />, { route: "/certificates", path: "/certificates" });
    expect(await screen.findByRole("heading", { name: "No certificates yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Pro" })).toHaveAttribute("href", "/checkout/plan/pro");
  });
});
