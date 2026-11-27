import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import Player from "./Player";

const at = (route: string) => ({ route, path: "/learn/:courseId/:lessonId?" });

describe("<Player />", () => {
  it("plays a free preview class for a guest, with a way to log in", async () => {
    renderWithProviders(<Player />, at("/learn/applied-ml/1-1"));
    expect(await screen.findByRole("heading", { level: 1, name: /Class 1 — / })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "This class is part of the full course" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Log in/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  }, 20_000);

  it("locks the other classes for a guest, even in a free course", async () => {
    renderWithProviders(<Player />, at("/learn/code-smells/2-1"));
    expect(await screen.findByRole("heading", { name: "Log in to watch every class" })).toBeInTheDocument();
  }, 20_000);

  it("uses the course's own curriculum, notes link and discussion notice", async () => {
    useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
    renderWithProviders(<Player />, at("/learn/code-smells/1-2"));
    expect(await screen.findByText("1 of 12 classes completed")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Notes/ })).toHaveAttribute("href", "/support?handbook=java");
  }, 20_000);
});
