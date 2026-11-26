import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import PathDetail from "./PathDetail";
import Paths from "./Paths";

const asStudent = async () => useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));

describe("<Paths /> and <PathDetail /> (F-008)", () => {
  it("lists learning paths and shows a path's steps with progress", async () => {
    await asStudent();
    renderWithProviders(<Paths />, { route: "/paths" });
    expect(await screen.findByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
  });

  it("a path page offers to add its paid courses to the cart", async () => {
    renderWithProviders(<PathDetail />, { route: "/paths/product-designer", path: "/paths/:pathId" });
    expect(await screen.findByRole("heading", { name: "Product Designer" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Add 3 paid courses to cart/ })).toBeInTheDocument();
  });
});
